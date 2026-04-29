import { EstadoMateria } from './estado.enum';

export interface MateriaEstadoDTO {
  id: string;
  codigo: string;
  nombre: string;
  creditos: number;
  semestre: number;
  estado: EstadoMateria;
  prerrequisitosNombres: string[];
}
