// Tipos de los datos de Leyendas de Terratéa – Libro 1 (generados a partir del manual).

export type AtributoId = 'fuerza' | 'destreza' | 'constitucion' | 'inteligencia' | 'sabiduria' | 'carisma';

export interface Imagenes { titulo: string | null; ilustraciones: string[] }

export interface Rasgo { nombre: string; efecto: string | null; texto: string }

export interface TiradaSalvacionFila {
  niveles: string; // "1-3", "19+", …
  venenos_toxicos: number;
  magia_maldiciones: number;
  paralisis_petrificacion_control_mental: number;
  quemadura_desangrado: number;
  sortilegios_encantamientos_trampas: number;
}

export interface Medidas { altura?: string; peso?: string; esperanza_vida?: string }

export interface Subraza {
  id: string; nombre: string; fortalezas: Rasgo[]; debilidades: Rasgo[]; imagenes: Imagenes; medidas?: Medidas;
}

export interface Raza {
  id: string; nombre: string; descripcion: string[];
  peso_max_carga_kg: number | null;
  fortalezas: Rasgo[]; debilidades: Rasgo[];
  tiradas_salvacion: TiradaSalvacionFila[];
  imagenes: Imagenes; medidas?: Medidas;
  subrazas?: Subraza[]; // sólo "renegado"
}

export interface Habilidad { nivel: number | null; nombre: string; descripcion: string; tipo: 'activa' | 'pasiva' | string | null }

export interface Clase {
  id: string; nombre: string; descripcion: string[];
  progresion: { nivel: number; experiencia: number; rango?: string }[];
  razas_disponibles: { raza: string; nombre: string; disponible: boolean }[];
  armadura: { ligera: boolean | null; media: boolean | null; pesada: boolean | null; notas?: string[] };
  movimiento: { base: number; combate: number; carrera: number; carga: number; huida: number };
  armas: string[];
  alineamiento: string[];
  rango_distancia: string | null;
  requisitos: ({ atributo: AtributoId; minimo: number; texto: string } | { texto: string })[];
  equipo_inicial: string[];
  informacion_adicional: string[];
  notas: string[];
  habilidades: Habilidad[];
  imagenes: Imagenes;
  instalacion_entrenamiento_offrol?: string;
}

export interface Tabla { titulo: string | null; columnas: string[]; filas: (Record<string, string> | string[])[] }
export interface Seccion { titulo: string | null; parrafos: string[]; tablas?: Tabla[]; imagenes?: string[] }

export interface Atributo { id: AtributoId; nombre: string; descripcion: string[]; tabla_modificadores: Tabla }

export interface ObjetoBase { nombre: string; categoria?: string; imagen?: string; [campo: string]: string | undefined }
export interface Arma extends ObjetoBase { coste?: string; dano?: string; peso?: string; manos?: string; tipo?: string; rango?: string; clase_peso?: 'ligera' | 'pesada' }
export interface Armadura extends ObjetoBase { coste?: string; clase_armadura?: string; peso?: string; ruido?: string; atributos_extra?: string }
export interface Transporte extends ObjetoBase { coste?: string; velocidad?: string; carga?: string; poderio_militar?: string; durabilidad?: string; mantenimiento?: string; dimensiones?: string }

export interface NivelGremio { nivel: number; nombre: string; descripcion: string | null; ventajas: string[] }
