package edu.ct.gateway.controller;

import edu.ct.gateway.dto.LoginResponse;
import edu.ct.gateway.dto.UpdateUserRequest;
import edu.ct.gateway.entity.User;
import edu.ct.gateway.repository.UserRepository;
import edu.ct.gateway.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class UserController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        // 비밀번호 암호화
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        // role이 설정되지 않은 경우 기본값 USER 설정
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        
        return userRepository.save(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(userDetails.getUsername());
                    user.setName(userDetails.getName());
                    user.setEmail(userDetails.getEmail());
                    user.setRole(userDetails.getRole());
                    user.setPhone(userDetails.getPhone());
                    user.setAddress(userDetails.getAddress());
                    
                    // 비밀번호가 비어있지 않은 경우에만 암호화 처리
                    if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                        user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                    }
                    
                    // birthDate 처리
                    if (userDetails.getBirthDate() != null) {
                        try {
                            // 이미 LocalDate 타입이므로 직접 설정
                            user.setBirthDate(userDetails.getBirthDate());
                        } catch (Exception e) {
                            // 날짜 형식 오류 처리
                            System.out.println("날짜 처리 오류: " + e.getMessage());
                        }
                    }
                    
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<Map<String, Boolean>> checkUsernameExists(@PathVariable String username) {
        boolean exists = userRepository.findByUsername(username).isPresent();
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("이미 존재하는 사용자입니다.");
        }

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        user.setRole("USER"); // 일반 사용자로 등록
        userRepository.save(user);
        return ResponseEntity.ok("회원가입 성공");
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        Optional<User> userOpt = userRepository.findByUsername(loginUser.getUsername());

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            if (passwordEncoder.matches(loginUser.getPassword(), user.getPassword())) {
                String token = jwtUtil.generateToken(user.getId(),user.getUsername());
                LoginResponse response = new LoginResponse(
                        token,
                        user.getId(),
                        user.getUsername(),
                        user.getRole()
                );
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패");
    }


    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.validateTokenAndGetUsername(token);
            User user = userRepository.findByUsername(username).orElseThrow();
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰 오류");
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyInfo(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UpdateUserRequest req
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.validateTokenAndGetUsername(token);

            Optional<User> optionalUser = userRepository.findByUsername(username);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다.");
            }

            User user = optionalUser.get();

            user.setName(req.getName());
            user.setEmail(req.getEmail());
            user.setPhone(req.getPhone());
            user.setAddress(req.getAddress());

            if (req.getBirthDate() != null && !req.getBirthDate().isBlank()) {
                try {
                    user.setBirthDate(LocalDate.parse(req.getBirthDate()));
                } catch (DateTimeParseException e) {
                    return ResponseEntity.badRequest().body("생년월일 형식이 올바르지 않습니다. (예: 1990-01-01)");
                }
            }

            if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
                if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                    return ResponseEntity.badRequest().body("현재 비밀번호가 일치하지 않습니다.");
                }
                user.setPassword(passwordEncoder.encode(req.getNewPassword()));
            }

            userRepository.save(user);
            return ResponseEntity.ok("정보가 성공적으로 수정되었습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰 오류 또는 요청 처리 실패");
        }
    }

} 