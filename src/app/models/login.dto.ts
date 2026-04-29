export interface LoginRequestDTO {
  usuario: string;
  password: string;
}

export interface RegistroRequestDTO {
  usuario: string;
  password: string;
  nombreCompleto: string;
}

export interface LoginResponseDTO {
  id: string;
  nombreCompleto: string;
  usuario: string;
  mensaje: string;
}
