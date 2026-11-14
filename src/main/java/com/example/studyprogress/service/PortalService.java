package com.example.studyprogress.service;
import com.example.studyprogress.dto.*;
import com.example.studyprogress.model.*;
import com.example.studyprogress.mapper.*;
import com.example.studyprogress.repository.*;
import com.example.studyprogress.exception.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
@Service
@Transactional
public class PortalService {
    private final CursoRepository courses;private final TareaRepository tasks;private final TemaRepository topics;
    private final EvaluacionRepository evaluations;private final ObjetivoRepository goals;private final RecordatorioRepository reminders;
    private final UsuarioRepository users;private final CursoService courseService;private final ProgresoService progress;
    private final CursoMapper cm;private final TareaMapper tm;private final TemaMapper topicMapper;private final ObjetivoMapper gm;
    private final RecordatorioMapper rm;private final EvaluacionMapper em;private final GamificacionService game;
    public PortalService(CursoRepository courses,TareaRepository tasks,TemaRepository topics,EvaluacionRepository evaluations,
        ObjetivoRepository goals,RecordatorioRepository reminders,UsuarioRepository users,CursoService courseService,ProgresoService progress,
        CursoMapper cm,TareaMapper tm,TemaMapper topicMapper,ObjetivoMapper gm,RecordatorioMapper rm,EvaluacionMapper em,GamificacionService game){
        this.courses=courses;this.tasks=tasks;this.topics=topics;this.evaluations=evaluations;this.goals=goals;this.reminders=reminders;
        this.users=users;this.courseService=courseService;this.progress=progress;this.cm=cm;this.tm=tm;this.topicMapper=topicMapper;
        this.gm=gm;this.rm=rm;this.em=em;this.game=game;
    }
    private Usuario user(String email){return users.findByEmail(email).orElseThrow(()->new UnauthorizedException("Usuario no encontrado"));}
    private void owner(String actual,String email){if(!actual.equals(email))throw new ForbiddenOperationException("No tienes acceso a este recurso");}
    private Pageable page(int page,int size,String sort,Set<String> allowed){
        if(page<0||!Set.of(10,25,50,100).contains(size)||!allowed.contains(sort))throw new InvalidOperationException("Paginación u ordenamiento no válido");
        return PageRequest.of(page,size,Sort.by(sort).ascending().and(Sort.by("id")));
    }
    @Transactional(readOnly=true)
    public PageResponse<CursoResponseDTO> courses(String email,int page,int size,String search,String sort){
        return PageResponse.of(courses.findByUsuarioEmailAndNombreContainingIgnoreCase(email,search,page(page,size,sort,Set.of("nombre","id"))).map(cm::toDTO));
    }
    @Transactional(readOnly=true)
    public PageResponse<TareaResponseDTO> tasks(String email,int page,int size,String search,String sort){
        return PageResponse.of(tasks.findByCursoUsuarioEmailAndTituloContainingIgnoreCase(email,search,page(page,size,sort,Set.of("titulo","fechaLimite","id","prioridad"))).map(tm::toDTO));
    }
    public CursoResponseDTO createCourse(CursoRequest body,String email){return cm.toDTO(courses.save(new Curso(body.getNombre(),body.getDescripcion(),user(email))));}
    public CursoResponseDTO updateCourse(long id,CursoRequest body,String email){
        Curso c=courseService.buscarCursoDelUsuario(id,email);c.setNombre(body.getNombre());c.setDescripcion(body.getDescripcion());return cm.toDTO(courses.save(c));
    }
    public void deleteCourse(long id,String email){
        Curso c=courseService.buscarCursoDelUsuario(id,email);
        tasks.deleteAll(tasks.findByCurso(c));topics.deleteAll(topics.findByCurso(c));evaluations.deleteAll(evaluations.findByCurso(c));courses.delete(c);
    }
    @Transactional(readOnly=true)
    public Map<String,Object> detail(long id,String email){
        Curso c=courseService.buscarCursoDelUsuario(id,email);
        return Map.of("curso",cm.toDTO(c),"progreso",progress.calcularProgresoCurso(c),"tareas",tasks.findByCurso(c).stream().map(tm::toDTO).toList(),
            "temas",topics.findByCurso(c).stream().map(topicMapper::toDTO).toList(),"evaluaciones",evaluations.findByCurso(c).stream().map(em::toDTO).toList());
    }
    @Transactional(readOnly=true)
    public Map<String,Object> dashboard(String email){
        Usuario u=user(email);List<Curso> all=courses.findByUsuario(u);
        List<Tarea> allTasks=all.stream().flatMap(c->tasks.findByCurso(c).stream()).toList();
        List<Objetivo> allGoals=goals.findByUsuario(u);
        return Map.of("cursos",all.size(),"tareasPendientes",allTasks.stream().filter(t->!t.isCompletada()).count(),
            "tareasCompletadas",allTasks.stream().filter(Tarea::isCompletada).count(),"objetivosCompletados",allGoals.stream().filter(Objetivo::isCompletado).count(),
            "puntos",u.getPuntos(),"nivel",game.obtenerNivel(u),"progreso",all.stream().map(progress::calcularProgresoCurso).toList(),
            "proximasTareas",allTasks.stream().filter(t->!t.isCompletada()).sorted(Comparator.comparing(Tarea::getFechaLimite)).limit(5).map(tm::toDTO).toList());
    }
    private void validateDateChange(LocalDate currentDate, LocalDate newDate, String field) {
        if (!newDate.equals(currentDate) && newDate.isBefore(LocalDate.now())) {
            throw new InvalidOperationException(field + " no puede cambiarse a una fecha pasada");
        }
    }

    public TareaResponseDTO updateTask(long id,TareaRequest body,String email){
        Tarea t=tasks.findByIdForUpdate(id).orElseThrow(()->new ResourceNotFoundException("Tarea no encontrada"));owner(t.getCurso().getUsuario().getEmail(),email);
        validateDateChange(t.getFechaLimite(), body.getFechaLimite(), "La fecha límite");
        t.setTitulo(body.getTitulo());t.setDescripcion(body.getDescripcion());t.setFechaLimite(body.getFechaLimite());t.setPrioridad(body.getPrioridad());return tm.toDTO(tasks.save(t));
    }
    public TemaResponseDTO updateTopic(long id,TemaRequest body,String email){
        Tema t=topics.findByIdForUpdate(id).orElseThrow(()->new ResourceNotFoundException("Tema no encontrado"));owner(t.getCurso().getUsuario().getEmail(),email);
        t.setNombre(body.getNombre());t.setDescripcion(body.getDescripcion());return topicMapper.toDTO(topics.save(t));
    }
    public ObjetivoResponseDTO updateGoal(long id,ObjetivoRequest body,String email){
        Objetivo t=goals.findByIdForUpdate(id).orElseThrow(()->new ResourceNotFoundException("Objetivo no encontrado"));owner(t.getUsuario().getEmail(),email);
        validateDateChange(t.getFechaLimite(), body.getFechaLimite(), "La fecha límite");
        t.setTitulo(body.getTitulo());t.setDescripcion(body.getDescripcion());t.setFechaLimite(body.getFechaLimite());return gm.toDTO(goals.save(t));
    }
    public RecordatorioResponseDTO updateReminder(long id,RecordatorioRequest body,String email){
        Recordatorio t=reminders.findById(id).orElseThrow(()->new ResourceNotFoundException("Recordatorio no encontrado"));owner(t.getUsuario().getEmail(),email);
        t.setTitulo(body.getTitulo());t.setDescripcion(body.getDescripcion());t.setFechaHora(body.getFechaHora());t.setEnviado(false);return rm.toDTO(reminders.save(t));
    }
    public EvaluacionResponseDTO updateEvaluation(long id,EvaluacionRequest body,String email){
        Evaluacion t=evaluations.findById(id).orElseThrow(()->new ResourceNotFoundException("Evaluación no encontrada"));owner(t.getCurso().getUsuario().getEmail(),email);
        validateDateChange(t.getFecha(), body.getFecha(), "La fecha de la evaluación");
        t.setTitulo(body.getTitulo());t.setDescripcion(body.getDescripcion());t.setFecha(body.getFecha());t.setTipo(body.getTipo());t.setPonderacion(body.getPonderacion());return em.toDTO(evaluations.save(t));
    }
    public CursoResponseDTO importCourse(CourseImportRequest body,String email){
        Curso c=courses.save(new Curso(body.nombre(),body.descripcion(),user(email)));
        for(String name:body.temas())topics.save(new Tema(name,"Importado mediante QR",c));return cm.toDTO(c);
    }
}
