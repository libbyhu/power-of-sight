package com.powerofsight.service;

import com.powerofsight.dto.LoginRequest;
import com.powerofsight.dto.RegisterRequest;
import com.powerofsight.entity.Room;
import com.powerofsight.entity.User;
import com.powerofsight.exception.ApiException;
import com.powerofsight.repository.RoomRepository;
import com.powerofsight.repository.UserRepository;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final RoomRepository rooms;
    private final PasswordEncoder passwordEncoder;
    /** 帳號不存在時也比對一次密碼，讓回應時間一致，不洩漏「這個 Email 有沒有註冊過」。 */
    private final String dummyHash;

    public AuthService(UserRepository users, RoomRepository rooms, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.rooms = rooms;
        this.passwordEncoder = passwordEncoder;
        this.dummyHash = passwordEncoder.encode("not-a-real-password");
    }

    /** 註冊會員，並同時建立他的書房。兩件事在同一個交易裡，要嘛都成功、要嘛都不做。 */
    @Transactional
    public User register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (users.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_TAKEN", "This email is already registered");
        }
        String displayName = request.displayName().strip();
        User user = users.save(new User(email, passwordEncoder.encode(request.password()), displayName));
        rooms.save(new Room(user.getId(), displayName + "的書房"));
        return user;
    }

    @Transactional(readOnly = true)
    public User login(LoginRequest request) {
        var found = users.findByEmail(normalizeEmail(request.email()));
        String hash = found.map(User::getPasswordHash).orElse(dummyHash);
        boolean ok = passwordEncoder.matches(request.password(), hash);
        if (found.isEmpty() || !ok) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email or password is incorrect");
        }
        return found.get();
    }

    @Transactional(readOnly = true)
    public User get(UUID userId) {
        // token 還有效但帳號已不存在時，當作未登入
        return users.findById(userId).orElseThrow(
                () -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Please sign in"));
    }

    private static String normalizeEmail(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }
}
