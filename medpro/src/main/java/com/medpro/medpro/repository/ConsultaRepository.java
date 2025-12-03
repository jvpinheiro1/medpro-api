package com.medpro.medpro.repository;

import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import com.medpro.medpro.model.entity.Consulta;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
    
    // Verifica se o médico tem consulta ativa (não cancelada) no horário
    boolean existsByMedicoIdAndDataConsultaAndMotivoCancelamentoIsNull(Long idMedico, LocalDateTime data);

    // Verifica se o paciente já tem consulta no mesmo dia
    boolean existsByPacienteIdAndDataConsultaBetween(Long pacienteId,
                                                     LocalDateTime inicio,
                                                     LocalDateTime fim);
                                                     
    boolean existsByMedicoIdAndDataConsultaBetween(Long idMedico,
                                               LocalDateTime inicio,
                                               LocalDateTime fim);
                                                 
}
