package com.moread.security;

import com.moread.common.BusinessException;
import com.moread.domain.User;
import com.moread.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository userRepository;

    public User get() {
        return optional().orElseThrow(() -> BusinessException.unauthorized("请先登录"));
    }

    public Optional<User> optional() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return Optional.empty();
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal p) {
            return userRepository.findById(p.id());
        }
        String name = auth.getName();
        if (name == null || "anonymousUser".equals(name)) return Optional.empty();
        return userRepository.findByEmail(name);
    }

    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
