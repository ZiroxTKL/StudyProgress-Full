package com.example.studyprogress.controller;
import com.example.studyprogress.dto.*;
import com.example.studyprogress.mapper.*;
import com.example.studyprogress.service.*;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/api/v1")
public class PortalController {
    private final PortalService portal;private final TareaService tasks;private final TemaService topics;private final ObjetivoService goals;
    private final RecordatorioService reminders;private final EvaluacionService evaluations;
    private final TareaMapper tm;private final TemaMapper topicMapper;private final ObjetivoMapper gm;private final RecordatorioMapper rm;private final EvaluacionMapper em;
    public PortalController(PortalService portal,TareaService tasks,TemaService topics,ObjetivoService goals,RecordatorioService reminders,
        EvaluacionService evaluations,TareaMapper tm,TemaMapper topicMapper,ObjetivoMapper gm,RecordatorioMapper rm,EvaluacionMapper em){
        this.portal=portal;this.tasks=tasks;this.topics=topics;this.goals=goals;this.reminders=reminders;this.evaluations=evaluations;
        this.tm=tm;this.topicMapper=topicMapper;this.gm=gm;this.rm=rm;this.em=em;
    }
    @GetMapping("/dashboard") public Map<String,Object> dashboard(Authentication a){return portal.dashboard(a.getName());}
    @GetMapping("/cursos") public PageResponse<CursoResponseDTO> courses(Authentication a,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="10") int size,
        @RequestParam(defaultValue="") String search,@RequestParam(defaultValue="nombre") String sort){return portal.courses(a.getName(),page,size,search,sort);}
    @GetMapping("/tareas") public PageResponse<TareaResponseDTO> tasks(Authentication a,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="10") int size,
        @RequestParam(defaultValue="") String search,@RequestParam(defaultValue="fechaLimite") String sort){return portal.tasks(a.getName(),page,size,search,sort);}
    @PostMapping("/cursos") public ResponseEntity<CursoResponseDTO> create(@Valid @RequestBody CursoRequest b,Authentication a){return ResponseEntity.status(201).body(portal.createCourse(b,a.getName()));}
    @PostMapping("/cursos/importar") public ResponseEntity<CursoResponseDTO> importCourse(@Valid @RequestBody CourseImportRequest b,Authentication a){return ResponseEntity.status(201).body(portal.importCourse(b,a.getName()));}
    @GetMapping("/cursos/{id}") public Map<String,Object> detail(@PathVariable long id,Authentication a){return portal.detail(id,a.getName());}
    @PutMapping("/cursos/{id}") public CursoResponseDTO update(@PathVariable long id,@Valid @RequestBody CursoRequest b,Authentication a){return portal.updateCourse(id,b,a.getName());}
    @DeleteMapping("/cursos/{id}") public ResponseEntity<Void> delete(@PathVariable long id,Authentication a){portal.deleteCourse(id,a.getName());return ResponseEntity.noContent().build();}
    @PostMapping("/cursos/{id}/tareas") public ResponseEntity<TareaResponseDTO> task(@PathVariable long id,@Validated(OnCreate.class) @RequestBody TareaRequest b,Authentication a){return ResponseEntity.status(201).body(tm.toDTO(tasks.crearTarea(id,b,a.getName())));}
    @PutMapping("/tareas/{id}") public TareaResponseDTO taskUpdate(@PathVariable long id,@Valid @RequestBody TareaRequest b,Authentication a){return portal.updateTask(id,b,a.getName());}
    @PatchMapping("/tareas/{id}/completar") public TareaResponseDTO taskComplete(@PathVariable long id,Authentication a){return tm.toDTO(tasks.completarTarea(id,a.getName()));}
    @DeleteMapping("/tareas/{id}") public ResponseEntity<Void> taskDelete(@PathVariable long id,Authentication a){tasks.eliminarTareaDelUsuario(id,a.getName());return ResponseEntity.noContent().build();}
    @PostMapping("/cursos/{id}/temas") public ResponseEntity<TemaResponseDTO> topic(@PathVariable long id,@Valid @RequestBody TemaRequest b,Authentication a){return ResponseEntity.status(201).body(topicMapper.toDTO(topics.crearTema(id,b,a.getName())));}
    @PutMapping("/temas/{id}") public TemaResponseDTO topicUpdate(@PathVariable long id,@Valid @RequestBody TemaRequest b,Authentication a){return portal.updateTopic(id,b,a.getName());}
    @PatchMapping("/temas/{id}/completar") public TemaResponseDTO topicComplete(@PathVariable long id,Authentication a){return topicMapper.toDTO(topics.completarTema(id,a.getName()));}
    @DeleteMapping("/temas/{id}") public ResponseEntity<Void> topicDelete(@PathVariable long id,Authentication a){topics.eliminarTemaDelUsuario(id,a.getName());return ResponseEntity.noContent().build();}
    @PostMapping("/cursos/{id}/evaluaciones") public ResponseEntity<EvaluacionResponseDTO> evaluation(@PathVariable long id,@Validated(OnCreate.class) @RequestBody EvaluacionRequest b,Authentication a){return ResponseEntity.status(201).body(em.toDTO(evaluations.crearEvaluacion(id,b,a.getName())));}
    @PutMapping("/evaluaciones/{id}") public EvaluacionResponseDTO evaluationUpdate(@PathVariable long id,@Valid @RequestBody EvaluacionRequest b,Authentication a){return portal.updateEvaluation(id,b,a.getName());}
    @PatchMapping("/evaluaciones/{id}/calificacion") public EvaluacionResponseDTO grade(@PathVariable long id,@Valid @RequestBody CalificacionRequest b,Authentication a){return em.toDTO(evaluations.registrarCalificacion(id,b,a.getName()));}
    @DeleteMapping("/evaluaciones/{id}") public ResponseEntity<Void> evaluationDelete(@PathVariable long id,Authentication a){evaluations.eliminarEvaluacionDelUsuario(id,a.getName());return ResponseEntity.noContent().build();}
    @GetMapping("/objetivos") public List<ObjetivoResponseDTO> goals(Authentication a){return goals.listarObjetivosDelUsuario(a.getName()).stream().map(gm::toDTO).toList();}
    @PostMapping("/objetivos") public ResponseEntity<ObjetivoResponseDTO> goal(@Validated(OnCreate.class) @RequestBody ObjetivoRequest b,Authentication a){return ResponseEntity.status(201).body(gm.toDTO(goals.crearObjetivo(b,a.getName())));}
    @PutMapping("/objetivos/{id}") public ObjetivoResponseDTO goalUpdate(@PathVariable long id,@Valid @RequestBody ObjetivoRequest b,Authentication a){return portal.updateGoal(id,b,a.getName());}
    @PatchMapping("/objetivos/{id}/completar") public ObjetivoResponseDTO goalComplete(@PathVariable long id,Authentication a){return gm.toDTO(goals.completarObjetivo(id,a.getName()));}
    @DeleteMapping("/objetivos/{id}") public ResponseEntity<Void> goalDelete(@PathVariable long id,Authentication a){goals.eliminarObjetivoDelUsuario(id,a.getName());return ResponseEntity.noContent().build();}
    @GetMapping("/recordatorios") public List<RecordatorioResponseDTO> reminders(Authentication a){return reminders.listarRecordatoriosDelUsuario(a.getName()).stream().map(rm::toDTO).toList();}
    @PostMapping("/recordatorios") public ResponseEntity<RecordatorioResponseDTO> reminder(@Valid @RequestBody RecordatorioRequest b,Authentication a){return ResponseEntity.status(201).body(rm.toDTO(reminders.crearRecordatorio(b,a.getName())));}
    @PutMapping("/recordatorios/{id}") public RecordatorioResponseDTO reminderUpdate(@PathVariable long id,@Valid @RequestBody RecordatorioRequest b,Authentication a){return portal.updateReminder(id,b,a.getName());}
    @DeleteMapping("/recordatorios/{id}") public ResponseEntity<Void> reminderDelete(@PathVariable long id,Authentication a){reminders.eliminarRecordatorioDelUsuario(id,a.getName());return ResponseEntity.noContent().build();}
}
