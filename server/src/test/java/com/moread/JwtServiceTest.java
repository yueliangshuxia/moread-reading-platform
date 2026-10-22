package com.moread;

import com.moread.domain.Role;
import com.moread.domain.User;
import com.moread.security.JwtService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class JwtServiceTest {

    @Test
    void generatesAndParsesToken() {
        JwtService jwt = new JwtService(
                "moread-reading-platform-test-secret-key-at-least-32-bytes", 2);
        User user = User.builder()
                .id(7L)
                .email("reader@moread.cn")
                .role(Role.READER)
                .build();

        String token = jwt.generate(user);

        assertNotNull(token);
        assertEquals("reader@moread.cn", jwt.extractEmail(token));
        assertEquals(7L, jwt.parse(token).get("uid", Long.class));
        assertEquals("READER", jwt.parse(token).get("role", String.class));
    }
}
