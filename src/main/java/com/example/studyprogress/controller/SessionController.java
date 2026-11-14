package com.example.studyprogress.controller;
import com.example.studyprogress.dto.*;
import com.example.studyprogress.mapper.UsuarioMapper;
import com.example.studyprogress.service.*;
import com.example.studyprogress.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;
import java.util.*;
@RestController
@RequestMapping("/api/v1/auth")
public class SessionController {
    private final AuthService auth;private final UsuarioService users;private final SessionService sessions;
    private final JwtService jwt;private final UsuarioMapper mapper;private final boolean secure;private final Set<String> origins;
    public SessionController(AuthService auth,UsuarioService users,SessionService sessions,JwtService jwt,UsuarioMapper mapper,
        @Value("${app.cookie-secure:true}") boolean secure,@Value("${app.allowed-origins:http://localhost:5173}") String origins){
        this.auth=auth;this.users=users;this.sessions=sessions;this.jwt=jwt;this.mapper=mapper;this.secure=secure;
        this.origins=new HashSet<>(Arrays.asList(origins.split(",")));
    }
    public record RefreshRequest(String refreshToken) {}
    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponseDTO> register(@Valid @RequestBody RegistroRequest body,HttpServletRequest req){
        checkOrigin(req);body.setEmail(body.getEmail().strip().toLowerCase(Locale.ROOT));
        return ResponseEntity.status(201).body(mapper.toDTO(auth.registrar(body)));
    }
    @PostMapping("/login")
    public ResponseEntity<Map<String,String>> login(@Valid @RequestBody LoginRequest body,HttpServletRequest req){
        checkOrigin(req);body.setEmail(body.getEmail().strip().toLowerCase(Locale.ROOT));
        String access=auth.login(body);
        var user=users.buscarPorEmail(jwt.extraerEmail(access)).orElseThrow(()->new UnauthorizedException("Usuario no encontrado"));
        return respond(sessions.issue(user),req);
    }
    @PostMapping("/refresh")
    public ResponseEntity<Map<String,String>> refresh(@RequestBody(required=false) RefreshRequest body,
        @CookieValue(name="sp_refresh",required=false) String cookie,HttpServletRequest req){
        checkOrigin(req);return respond(sessions.rotate(token(body,cookie,req)),req);
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required=false) RefreshRequest body,
        @CookieValue(name="sp_refresh",required=false) String cookie,HttpServletRequest req){
        checkOrigin(req);sessions.revoke(token(body,cookie,req));
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE,cookie("",Duration.ZERO).toString()).build();
    }
    @GetMapping("/me")
    public UsuarioResponseDTO me(Authentication a){return mapper.toDTO(users.buscarPorEmail(a.getName()).orElseThrow(()->new UnauthorizedException("Usuario no encontrado")));}
    private String token(RefreshRequest body,String cookie,HttpServletRequest req){return nativeClient(req)&&body!=null?body.refreshToken():cookie;}
    private boolean nativeClient(HttpServletRequest req){return "native".equals(req.getHeader("X-Client"))&&req.getHeader("Origin")==null;}
    private ResponseEntity<Map<String,String>> respond(SessionService.Tokens tokens,HttpServletRequest req){
        if(nativeClient(req))return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(Map.of("token",tokens.token(),"refreshToken",tokens.refreshToken()));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header(HttpHeaders.SET_COOKIE,cookie(tokens.refreshToken(),Duration.ofDays(7)).toString()).body(Map.of("token",tokens.token()));
    }
    private ResponseCookie cookie(String value,Duration age){return ResponseCookie.from("sp_refresh",value).httpOnly(true).secure(secure).sameSite("Strict").path("/api/v1/auth").maxAge(age).build();}
    private void checkOrigin(HttpServletRequest req){
        String origin=req.getHeader("Origin");
        if(origin!=null&&!origins.contains(origin))throw new ForbiddenOperationException("Origen no permitido");
        if("cross-site".equals(req.getHeader("Sec-Fetch-Site")))throw new ForbiddenOperationException("Solicitud entre sitios no permitida");
    }
}
