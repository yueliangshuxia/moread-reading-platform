"""墨阅后端接口冒烟测试。

用法：
    python tools/smoke_api.py
    python tools/smoke_api.py http://127.0.0.1:8080

要求后端已启动，并且数据库是种子数据状态（首次启动即可）。
"""
import json
import sys
import time
import urllib.error
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8080").rstrip("/")
PASS, FAIL = [], []


def call(method, path, body=None, token=None):
    data = None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8")
    headers = {"Content-Type": "application/json; charset=utf-8"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as ex:
        raw = ex.read().decode("utf-8")
        try:
            return ex.code, json.loads(raw)
        except Exception:
            return ex.code, {"message": raw}


def ok(name, condition, extra=""):
    (PASS if condition else FAIL).append(name + ((" — " + str(extra)) if extra else ""))
    print(("PASS " if condition else "FAIL ") + name + ((" — " + str(extra)) if extra else ""))


def data_of(response):
    return (response[1] or {}).get("data")


# 1. health + auth
status, health = call("GET", "/api/health")
ok("health", status == 200 and health.get("code") == 0)

status, public_stats = call("GET", "/api/stats/public")
public_data = data_of((status, public_stats)) or {}
ok("public stats", status == 200 and public_data.get("books") == 27 and public_data.get("readers", 0) >= 10, public_data)

status, _ = call("GET", "/api/profile")
ok("protected endpoint requires login", status == 401, status)

status, login = call("POST", "/api/auth/login", {"email": "reader@moread.cn", "password": "123456"})
reader = data_of((status, login)) or {}
reader_token = reader.get("token")
ok("reader login", status == 200 and bool(reader_token), (reader.get("user") or {}).get("name"))

status, me = call("GET", "/api/auth/me", token=reader_token)
ok("auth me", status == 200 and data_of((status, me)).get("email") == "reader@moread.cn")

status, admin_login = call("POST", "/api/auth/login", {"email": "admin@moread.cn", "password": "admin123"})
admin = data_of((status, admin_login)) or {}
admin_token = admin.get("token")
ok("admin login", status == 200 and bool(admin_token), (admin.get("user") or {}).get("role"))

# 2. catalog
status, books_resp = call("GET", "/api/books?size=100")
books = data_of((status, books_resp)) or {}
ok("book list", status == 200 and books.get("total") == 27, books.get("total"))
first = (books.get("content") or [{}])[0]
ok("book fields", bool(first.get("title")) and "cover" in first and "scores" in first, first.get("title"))

status, detail = call("GET", "/api/books/zhaohuaxishi")
detail_data = data_of((status, detail)) or {}
ok("book detail", status == 200 and detail_data.get("title") == "朝花夕拾", detail_data.get("title"))
ok("book chapters", len(detail_data.get("chapters") or []) > 3, len(detail_data.get("chapters") or []))

status, chapter = call("GET", "/api/books/zhaohuaxishi/chapters/1")
ok("chapter content", status == 200 and len((data_of((status, chapter)) or {}).get("content") or "") > 100)

status, cats = call("GET", "/api/categories")
cat_list = data_of((status, cats)) or []
ok("categories", status == 200 and len(cat_list) == 8, len(cat_list))
classic = next((c for c in cat_list if c["id"] == "classic"), {})
ok("category count", classic.get("count") == 7, classic.get("count"))

status, lists = call("GET", "/api/booklists")
list_data = data_of((status, lists)) or []
ok("booklists", status == 200 and len(list_data) == 3, len(list_data))
ok("booklist items", len(list_data[0].get("books") or []) == 5, len(list_data[0].get("books") or []))

# 3. recommendation + profile
status, recs = call("GET", "/api/recommendations/home?limit=6", token=reader_token)
rec_data = data_of((status, recs)) or []
ok("home recommendations", status == 200 and len(rec_data) == 6, len(rec_data))
ok("reasons + factors", all(r.get("reason") and r.get("factors") for r in rec_data))
if rec_data:
    print("     推荐:", ", ".join(r["book"]["title"] for r in rec_data))

status, profile = call("GET", "/api/profile", token=reader_token)
prof = data_of((status, profile)) or {}
stats = prof.get("stats") or {}
ok("profile", status == 200 and prof.get("name") == "林见鹿", prof.get("name"))
ok("stats shape", len(stats.get("heatmap") or []) == 84 and len(stats.get("weeklyMinutes") or []) == 7,
   (len(stats.get("heatmap") or []), len(stats.get("weeklyMinutes") or [])))
ok("stats values", stats.get("hours", 0) > 0 and stats.get("finished", 0) >= 2,
   (stats.get("hours"), stats.get("finished"), stats.get("notes")))
ok("reading goal", (stats.get("goal") or {}).get("target") == 24, stats.get("goal"))

status, shelf = call("GET", "/api/shelf", token=reader_token)
shelf_data = data_of((status, shelf)) or {}
ok("shelf", status == 200 and len(shelf_data.get("reading") or []) >= 1, {
    k: len(shelf_data.get(k) or []) for k in ("reading", "want", "finished", "paused")
})

# 4. shelf mutation
status, _ = call("PUT", "/api/shelf/nahan", {"status": "READING"}, token=reader_token)
status2, one = call("GET", "/api/shelf/nahan", token=reader_token)
ok("shelf upsert", status2 == 200 and (data_of((status2, one)) or {}).get("status") == "READING")
call("DELETE", "/api/shelf/nahan", token=reader_token)

# 5. notes
status, notes = call("GET", "/api/notes?bookId=hulanhezhuan", token=reader_token)
ok("notes list", status == 200 and len(data_of((status, notes)) or []) >= 1, len(data_of((status, notes)) or []))
status, note = call("POST", "/api/notes", {
    "bookId": "hulanhezhuan", "chapterNo": 3,
    "quote": "花开了，就像花睡醒了似的。",
    "content": "冒烟测试笔记", "type": "NOTE", "page": "第 78 页"
}, token=reader_token)
note_data = data_of((status, note)) or {}
ok("note create", status == 200 and note_data.get("id") is not None, note_data.get("id"))
if note_data.get("id"):
    call("DELETE", "/api/notes/" + str(note_data["id"]), token=reader_token)

# 6. reviews + admin moderation
status, reviews = call("GET", "/api/books/hulanhezhuan/reviews")
ok("public reviews", status == 200 and len(data_of((status, reviews)) or []) >= 1,
   len(data_of((status, reviews)) or []))
status, new_review = call("POST", "/api/books/hulanhezhuan/reviews",
                          {"rating": 5, "content": "冒烟测试：这本书让我停下来了。"}, token=reader_token)
rev = data_of((status, new_review)) or {}
ok("review submit", status == 200 and rev.get("status") == "PENDING", rev.get("status"))

status, pending = call("GET", "/api/admin/reviews?status=PENDING", token=admin_token)
pending_list = data_of((status, pending)) or []
ok("admin pending reviews", status == 200 and len(pending_list) >= 3, len(pending_list))
if pending_list:
    rid = pending_list[0]["id"]
    status, approved = call("POST", f"/api/admin/reviews/{rid}/approve", token=admin_token)
    ok("admin approve review", status == 200 and (data_of((status, approved)) or {}).get("status") == "PASSED")

# 7. community
status, posts = call("GET", "/api/community/posts", token=reader_token)
post_list = data_of((status, posts)) or []
ok("community posts", status == 200 and len(post_list) >= 8, len(post_list))
if post_list:
    pid = post_list[0]["id"]
    before = post_list[0]["comments"]
    status, comment = call("POST", f"/api/community/posts/{pid}/comments",
                           {"content": "冒烟测试回应。"}, token=reader_token)
    ok("community comment", status == 200 and (data_of((status, comment)) or {}).get("text") == "冒烟测试回应。")
    status, like = call("POST", f"/api/community/posts/{pid}/like", token=reader_token)
    ok("community like", status == 200 and (data_of((status, like)) or {}).get("likes", 0) > 0)

# 8. admin
status, overview = call("GET", "/api/admin/overview", token=admin_token)
over = data_of((status, overview)) or {}
ok("admin overview", status == 200 and over.get("users", 0) >= 10 and over.get("books", 0) >= 27,
   (over.get("users"), over.get("books"), over.get("pendingReviews")))
ok("admin chart data", len(over.get("weeklyActiveSeries") or []) == 7 and len(over.get("categories") or []) > 0)

status, admin_books = call("GET", "/api/admin/books", token=admin_token)
ok("admin books", status == 200 and len(data_of((status, admin_books)) or []) >= 27,
   len(data_of((status, admin_books)) or []))

status, new_book = call("POST", "/api/admin/books", {
    "title": "冒烟测试书", "author": "测试作者", "categoryId": "contemporary",
    "tags": ["测试"], "rating": 8.1, "words": "9 万", "publishedYear": 2026,
    "status": "连载", "free": True, "original": True,
    "blurb": "测试用图书。", "intro": "测试用图书。"
}, token=admin_token)
book_created = data_of((status, new_book)) or {}
ok("admin create book", status == 200 and book_created.get("title") == "冒烟测试书", book_created.get("id"))
if book_created.get("id"):
    call("PUT", f"/api/admin/books/{book_created['id']}/listed", {"listed": False}, token=admin_token)

status, users = call("GET", "/api/admin/users", token=admin_token)
ok("admin users", status == 200 and len(data_of((status, users)) or []) >= 10,
   len(data_of((status, users)) or []))

status, weights = call("GET", "/api/admin/recommendation/weights", token=admin_token)
w = data_of((status, weights)) or {}
ok("weights read", status == 200 and round(w.get("content", 0)) == 35, w)
status, updated = call("PUT", "/api/admin/recommendation/weights",
                       {"content": 40, "cf": 30, "popularity": 20, "freshness": 10}, token=admin_token)
w2 = data_of((status, updated)) or {}
ok("weights update", status == 200 and round(w2.get("content", 0)) == 40, w2)
status, _ = call("POST", "/api/admin/recommendations/rebuild", token=admin_token)
ok("recommendation rebuild", status == 200)

# 9. security boundaries
status, _ = call("GET", "/api/admin/overview", token=reader_token)
ok("reader cannot access admin", status == 403, status)

# 10. new user cold start
email = "smoke%d@moread.cn" % int(time.time())
status, reg = call("POST", "/api/auth/register",
                   {"name": "冒烟读者", "email": email, "password": "123456"})
reg_data = data_of((status, reg)) or {}
new_token = reg_data.get("token")
ok("register", status == 200 and bool(new_token), email)
status, cold = call("GET", "/api/recommendations/home?limit=6", token=new_token)
ok("cold start recommendations", status == 200 and len(data_of((status, cold)) or []) == 6,
   len(data_of((status, cold)) or []))
status, cold_profile = call("GET", "/api/profile", token=new_token)
ok("cold start profile", status == 200 and (data_of((status, cold_profile)) or {}).get("stats") is not None)

# 11. reading event + progress
call("POST", "/api/reading/events", {
    "bookId": "hulanhezhuan", "eventType": "SESSION", "durationSeconds": 600, "percent": 42
}, token=reader_token)
status, progress = call("PUT", "/api/reading/progress/hulanhezhuan",
                        {"percent": 55, "chapterNo": 3}, token=reader_token)
ok("save progress", status == 200 and (data_of((status, progress)) or {}).get("percent") == 55)
status, progress2 = call("GET", "/api/reading/progress/hulanhezhuan", token=reader_token)
ok("read progress", status == 200 and (data_of((status, progress2)) or {}).get("percent") == 55)
status, stats2 = call("GET", "/api/reading/stats", token=reader_token)
ok("reading stats after event", status == 200 and len((data_of((status, stats2)) or {}).get("weeklyMinutes") or []) == 7)

print("\n===== RESULT =====")
print("PASS:", len(PASS), " FAIL:", len(FAIL))
if FAIL:
    print("失败项：")
    for item in FAIL:
        print(" -", item)
    sys.exit(1)
print("全部通过")
