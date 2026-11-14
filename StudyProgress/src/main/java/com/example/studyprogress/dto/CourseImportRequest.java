package com.example.studyprogress.dto;
import jakarta.validation.constraints.*;
import java.util.List;
public record CourseImportRequest(@NotBlank @Size(min=2,max=100) String nombre,
    @Size(max=500) String descripcion,@NotNull @Size(max=10) List<@NotBlank @Size(min=2,max=100) String> temas) {}
