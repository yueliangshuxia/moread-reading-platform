package com.moread.service;

import com.moread.common.BusinessException;
import com.moread.domain.*;
import com.moread.dto.AuthResponse;
import com.moread.dto.AuthUserDto;
import com.moread.dto.Requests;
import com.moread.repository.ReadingGoalRepository;
import com.moread.repository.UserProfileRepository;
import com.moread.repository.UserRepository;
import com.moread.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final UserProfileRepository profiles;
    private final ReadingGoalRepository goals;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(Requests.Register req) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) {
            throw new BusinessException("这个邮箱已经注册过了");
        }
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(req.password()))
                .name(req.name().trim())
                .handle("@" + email.substring(0, email.indexOf('@')))
                .avatar(0)
                .bio("刚刚加入墨阅。")
                .role(Role.READER)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        users.save(user);
        profiles.save(UserProfile.builder().user(user).build());
        goals.save(ReadingGoal.builder()
                .user(user)
                .year(LocalDate.now().getYear())
                .target(24)
                .build());
        return new AuthResponse(jwtService.generate(user), DtoMapper.toAuthUser(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(Requests.Login req) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        User user = users.findByEmail(email)
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "邮箱或密码错误"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "邮箱或密码错误");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw BusinessException.forbidden("账号已被禁言，请联系管理员");
        }
        return new AuthResponse(jwtService.generate(user), DtoMapper.toAuthUser(user));
    }

    public AuthUserDto me(User user) {
        return DtoMapper.toAuthUser(user);
    }
}
