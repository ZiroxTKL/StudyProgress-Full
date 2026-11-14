package com.example.studyprogress;
import com.example.studyprogress.model.*;import com.example.studyprogress.service.*;
import org.junit.jupiter.api.Test;import java.util.List;
import static org.mockito.Mockito.*;import static org.junit.jupiter.api.Assertions.*;
class ProgressServiceTest {
    @Test void emptyCourseHasZeroProgressAndNoInventedAverage(){var topic=mock(TemaService.class);var task=mock(TareaService.class);var eval=mock(EvaluacionService.class);Curso c=new Curso();when(topic.listarTemasPorCurso(c)).thenReturn(List.of());when(task.listarTareasPorCurso(c)).thenReturn(List.of());when(eval.listarEvaluacionesPorCurso(c)).thenReturn(List.of());var p=new ProgresoServiceImpl(topic,task,eval).calcularProgresoCurso(c);assertEquals(0,p.getPorcentajeProgreso());assertNull(p.getPromedioEvaluaciones());}
    @Test void completedTopicsAndTasksShareTheSameDenominator(){var topic=mock(TemaService.class);var task=mock(TareaService.class);var eval=mock(EvaluacionService.class);Curso c=new Curso();Tema done=new Tema();done.setCompletado(true);Tarea pending=new Tarea();when(topic.listarTemasPorCurso(c)).thenReturn(List.of(done));when(task.listarTareasPorCurso(c)).thenReturn(List.of(pending));when(eval.listarEvaluacionesPorCurso(c)).thenReturn(List.of());assertEquals(50,new ProgresoServiceImpl(topic,task,eval).calcularProgresoCurso(c).getPorcentajeProgreso());}
}
