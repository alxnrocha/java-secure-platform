package com.alxnrocha.vaultledger.security;

import com.alxnrocha.vaultledger.entity.UserEntity;
import com.alxnrocha.vaultledger.enums.RoleType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

public class CustomUserDetails implements UserDetails {

    private final UserEntity user;
    private final UUID id;
    private final String username;
    private final String email;
    private final String password;
    private final RoleType role;
    private final boolean active;
    private final boolean mfaEnabled;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(UserEntity user) {
        this.user = user;
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.role = user.getRole();
        this.active = user.isActive();
        this.mfaEnabled = user.isMfaEnabled();
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()));
    }

    public UserEntity getUser() {
        return user;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public RoleType getRole() {
        return role;
    }

    public boolean isMfaEnabled() {
        return mfaEnabled;
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
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
