package com.oerms.auth.security;

import com.oerms.auth.entity.User;
import com.oerms.common.enums.Role;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

    @Getter
    private final UUID userId;
    private final String username;
    private final String password;
    private final boolean enabled;
    private final boolean accountNonExpired;
    private final boolean accountNonLocked;
    private final boolean credentialsNonExpired;
    private final Collection<? extends GrantedAuthority> authorities;

    public static CustomUserDetails from(User user) {
        Set<GrantedAuthority> authorities = new HashSet<>();

        // Add roles with ROLE_ prefix
        user.getRoles().forEach(role ->
            authorities.add(new SimpleGrantedAuthority(role.getRoleWithPrefix()))
        );

        // Add granular permissions based on roles
        user.getRoles().forEach(role -> {
            switch (role) {
                case STUDENT -> {
                    authorities.add(new SimpleGrantedAuthority("exam:read"));
                    authorities.add(new SimpleGrantedAuthority("attempt:create"));
                    authorities.add(new SimpleGrantedAuthority("result:read"));
                }
                case TEACHER -> {
                    authorities.add(new SimpleGrantedAuthority("exam:create"));
                    authorities.add(new SimpleGrantedAuthority("exam:read"));
                    authorities.add(new SimpleGrantedAuthority("exam:update"));
                    authorities.add(new SimpleGrantedAuthority("exam:delete"));
                    authorities.add(new SimpleGrantedAuthority("question:create"));
                    authorities.add(new SimpleGrantedAuthority("question:read"));
                    authorities.add(new SimpleGrantedAuthority("question:update"));
                    authorities.add(new SimpleGrantedAuthority("question:delete"));
                    authorities.add(new SimpleGrantedAuthority("result:read"));
                }
                case ADMIN -> {
                    authorities.add(new SimpleGrantedAuthority("exam:create"));
                    authorities.add(new SimpleGrantedAuthority("exam:read"));
                    authorities.add(new SimpleGrantedAuthority("exam:update"));
                    authorities.add(new SimpleGrantedAuthority("exam:delete"));
                    authorities.add(new SimpleGrantedAuthority("question:create"));
                    authorities.add(new SimpleGrantedAuthority("question:read"));
                    authorities.add(new SimpleGrantedAuthority("question:update"));
                    authorities.add(new SimpleGrantedAuthority("question:delete"));
                    authorities.add(new SimpleGrantedAuthority("attempt:create"));
                    authorities.add(new SimpleGrantedAuthority("result:read"));
                    authorities.add(new SimpleGrantedAuthority("user:manage"));
                }
            }
        });

        return new CustomUserDetails(
            user.getId(),
            user.getUserName(),
            user.getPassword(),
            user.isEnabled(),
            user.isAccountNonExpired(),
            user.isAccountNonLocked(),
            user.isCredentialsNonExpired(),
            authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}