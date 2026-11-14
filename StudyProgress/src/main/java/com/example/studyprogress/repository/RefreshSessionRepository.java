package com.example.studyprogress.repository;
import com.example.studyprogress.model.RefreshSession;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface RefreshSessionRepository extends JpaRepository<RefreshSession,Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from RefreshSession s join fetch s.usuario where s.tokenHash=:hash")
    Optional<RefreshSession> findLocked(@Param("hash") String hash);
    void deleteByTokenHash(String hash);
    void deleteByUsuarioId(Long id);
}
