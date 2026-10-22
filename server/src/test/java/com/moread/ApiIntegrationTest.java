package com.moread;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @Test
    void publicApiAndAuthFlow() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        mvc.perform(get("/api/stats/public"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.books").value(27))
                .andExpect(jsonPath("$.data.readers").isNumber());

        mvc.perform(get("/api/profile"))
                .andExpect(status().isUnauthorized());

        String reader = login("reader@moread.cn", "123456");
        mvc.perform(get("/api/auth/me").header("Authorization", bearer(reader)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("reader@moread.cn"));

        mvc.perform(get("/api/books?size=100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(27));

        mvc.perform(get("/api/books/zhaohuaxishi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("朝花夕拾"))
                .andExpect(jsonPath("$.data.chapters.length()").value(12));

        mvc.perform(get("/api/recommendations/home?limit=6").header("Authorization", bearer(reader)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(6))
                .andExpect(jsonPath("$.data[0].reason").isNotEmpty());

        mvc.perform(get("/api/profile").header("Authorization", bearer(reader)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stats.heatmap.length()").value(84))
                .andExpect(jsonPath("$.data.stats.weeklyMinutes.length()").value(7))
                .andExpect(jsonPath("$.data.stats.goal.target").value(24));

        mvc.perform(get("/api/profile/reviews").header("Authorization", bearer(reader)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        mvc.perform(get("/api/admin/overview").header("Authorization", bearer(reader)))
                .andExpect(status().isForbidden());
    }

    @Test
    void readerMutations() throws Exception {
        String reader = login("reader@moread.cn", "123456");

        mvc.perform(put("/api/shelf/nahan")
                        .header("Authorization", bearer(reader))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("status", "READING"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("READING"));

        mvc.perform(delete("/api/shelf/nahan").header("Authorization", bearer(reader)))
                .andExpect(status().isOk());

        MvcResult noteResult = mvc.perform(post("/api/notes")
                        .header("Authorization", bearer(reader))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "bookId", "hulanhezhuan",
                                "chapterNo", 3,
                                "quote", "花开了，就像花睡醒了似的。",
                                "content", "集成测试笔记",
                                "type", "NOTE",
                                "page", "第 78 页"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.note").value("集成测试笔记"))
                .andReturn();
        long noteId = jsonNode(noteResult).path("data").path("id").asLong();
        mvc.perform(delete("/api/notes/" + noteId).header("Authorization", bearer(reader)))
                .andExpect(status().isOk());

        mvc.perform(post("/api/community/posts/p1/comments")
                        .header("Authorization", bearer(reader))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("content", "集成测试回应"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.text").value("集成测试回应"));

        mvc.perform(put("/api/reading/progress/hulanhezhuan")
                        .header("Authorization", bearer(reader))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("percent", 55, "chapterNo", 3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.percent").value(55));

        mvc.perform(get("/api/reading/progress/hulanhezhuan").header("Authorization", bearer(reader)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.percent").value(55));

        mvc.perform(post("/api/reading/events")
                        .header("Authorization", bearer(reader))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "bookId", "hulanhezhuan",
                                "eventType", "SESSION",
                                "durationSeconds", 600,
                                "percent", 55
                        ))))
                .andExpect(status().isOk());

        mvc.perform(get("/api/reading/stats").header("Authorization", bearer(reader)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.weeklyMinutes.length()").value(7));
    }

    @Test
    void adminFlow() throws Exception {
        String admin = login("admin@moread.cn", "admin123");

        MvcResult overview = mvc.perform(get("/api/admin/overview").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.books").value(27))
                .andExpect(jsonPath("$.data.weeklyActiveSeries.length()").value(7))
                .andReturn();
        int users = jsonNode(overview).path("data").path("users").asInt();
        assertTrue(users >= 10);

        MvcResult pending = mvc.perform(get("/api/admin/reviews?status=PENDING").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode pendingList = jsonNode(pending).path("data");
        assertTrue(pendingList.size() >= 1);
        long reviewId = pendingList.get(0).path("id").asLong();

        mvc.perform(post("/api/admin/reviews/" + reviewId + "/approve").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PASSED"));

        mvc.perform(get("/api/admin/recommendation/weights").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").value(35.0));

        mvc.perform(put("/api/admin/recommendation/weights")
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("content", 40, "cf", 30, "popularity", 20, "freshness", 10))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").value(40.0));

        mvc.perform(post("/api/admin/recommendations/rebuild").header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test
    void registerAndColdStart() throws Exception {
        String email = "it" + System.currentTimeMillis() + "@moread.cn";
        MvcResult result = mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("name", "集成测试读者", "email", email, "password", "123456"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.name").value("集成测试读者"))
                .andReturn();
        String token = jsonNode(result).path("data").path("token").asText();

        mvc.perform(get("/api/recommendations/home?limit=6").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(6));

        mvc.perform(get("/api/profile").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("集成测试读者"));
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn();
        return jsonNode(result).path("data").path("token").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private String json(Object value) throws Exception {
        return mapper.writeValueAsString(value);
    }

    private JsonNode jsonNode(MvcResult result) throws Exception {
        return mapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }
}
