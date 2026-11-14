package com.example.studyprogress.repository;

import com.example.studyprogress.model.Curso;
import com.example.studyprogress.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

import java.util.List;

public interface TareaRepository extends JpaRepository<Tarea, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select activity from Tarea activity where activity.id = :id")
    Optional<Tarea> findByIdForUpdate(@Param("id") Long id);

    List<Tarea> findByCurso(Curso curso);

    List<Tarea> findByCursoAndCompletada(Curso curso, boolean completada);
    org.springframework.data.domain.Page<Tarea> findByCursoUsuarioEmailAndTituloContainingIgnoreCase(String email,String search,org.springframework.data.domain.Pageable pageable);
}
