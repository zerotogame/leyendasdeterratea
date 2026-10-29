// Leyendas de Terratéa – Libro 2 · Interfaces de los JSON de data/
// Todas las rutas de imagen son relativas a la carpeta terratea-libro2/.

export type TipoCriatura =
  | 'bestias' | 'demoniacos' | 'divinos' | 'elementales' | 'espirituales'
  | 'humanoides' | 'seres-impios' | 'mecanicos' | 'nexianos';

export type Categoria = 1 | 2 | 3 | 4 | 5;
export type EjeAlineamiento = 'legal' | 'neutral' | 'caotico';
export type Plano =
  | 'terrenal' | 'espiritual' | 'elemental' | 'infernal' | 'sagrado' | 'abisal'
  | 'arcano' | 'atemporal' | 'ensueno' | 'astral' | 'desconocido' | 'multiples';

/** data/bestiario.json → Criatura[] (450 fichas) */
export interface Criatura {
  id: string;                    // slug sin tildes: "angel-tersediano"
  nombre: string;                // "Ángel Tersediano"
  nombre_libro: string;          // tal cual en el libro: "ÁNGEL TERSEDIANO"
  categoria: Categoria;          // sección del libro (fuente de verdad)
  categoria_indicada_en_ficha: Categoria | null; // lo que pone la ficha (null si la ficha no lo indica)
  tipos: TipoCriatura[];         // 1..n, leídos de los iconos de la ficha
  texto: {                       // valores EXACTOS del libro (mostrar estos en la ficha)
    dano: string | null; ca: string | null; vitalidad: string | null;
    px: string | null; movimiento: string | null; alcance: string | null;
  };
  dano: {
    dados: { cantidad: number; caras: number }[]; // [{cantidad:1,caras:6},{cantidad:2,caras:20}]
    formula: string | null;      // "1D6 + 2D20"
    descripcion: string | null;  // "Golpe Acuático Sagrado"
    promedio: number | null;
    maximo: number | null;
  };
  ca: number | null;             // null = «¿?» en el libro
  vitalidad: number | null;
  px: number | null;
  movimiento_casillas: number | null;
  alcance_casillas: number | null;
  descripcion: string;
  fortalezas: string[];
  debilidades: string[];
  localizacion: string;
  planos: Plano[];               // derivado de `localizacion` (para filtros)
  alineamiento: string;          // texto original ("Neutral/Caótico")
  alineamiento_ejes: EjeAlineamiento[];
  imagen: string;                // "img/bestiario/<id>.webp"
  pagina: number;                // página del PDF
}

/** data/bestiario_reglas.json */
export interface ReglasBestiario {
  fuente: string;
  introduccion: string;
  nota_recuento: string;
  categorias: {
    id: Categoria; nombre: string; titulo_intro: string; pagina_inicio: number;
    caracteristicas: string; ejemplos: string[]; desafios: string;
    bonificacion_atributos: { min: number | null; max: number | null; texto: string };
    ejemplo_atributos: string;
    portada: string; total_criaturas: number;
    rangos_observados: Record<'ca' | 'vitalidad' | 'px' | 'movimiento_casillas' | 'alcance_casillas' | 'dano_maximo',
      { min: number; max: number } | null>;
  }[];
  tipos: { id: TipoCriatura; nombre: string; icono: string; icono_png: string; total_criaturas: number }[];
  nota_tipos: string;
  ficha: { campos: { id: string; etiqueta: string; descripcion: string }[]; valores_desconocidos: string };
  planos: Plano[];
  aviso_homenajes: string;
}

/** data/npcs.json */
export interface NpcsFile {
  reinos: { id: Reino; nombre: string }[];
  npcs: Npc[];
  parlamento_overfield: {
    pagina: number; nota: string;
    grupos: { id: string; miembros: string[]; raza: string; descripcion: string; caracteristicas: string }[];
  };
}
export type Reino = 'stungerb' | 'maurizanian' | 'lusitanius' | 'revelfbolth' | 'overfield';
export interface Npc {
  id: string; nombre: string;    // nombre incluye el cargo: "General del Ejército Grom Dahl"
  raza: string;                  // texto libre del libro ("Semielfo", "Renegado (Hombre-Lobo)")
  reino: Reino;
  descripcion: string;
  caracteristicas: string;       // texto original
  rasgos: string[];              // `caracteristicas` partido por comas
  actitud_propuestas: string | null; // solo miembros del Consejo CITB
  imagen: string | null;
  pagina: number;
}

/** data/gremios_pnj.json */
export interface GremiosPnjFile {
  introduccion: string;
  gremios: {
    id: string; nombre: string; descripcion: string; emblema: string | null; pagina: number;
    miembros: { cargo: string; nombre: string; raza: string | null; descripcion: string }[];
  }[];
}

/** data/deidades.json */
export interface DeidadesFile {
  introduccion: string;
  abreviaturas_alineamiento: Record<string, string>; // L, N, C, NL, NC, N/C, N/L
  grupos: { id: GrupoDeidad; nombre: string }[];
  colores_astrales: { tirada: number; plano: string; color: string }[]; // tabla d10
  deidades: Deidad[];
}
export type GrupoDeidad = 'supremo' | 'norte' | 'este' | 'oeste' | 'sur' | 'paganos' | 'infernales' | 'titanes';
export interface Deidad {
  id: string; nombre: string; nombre_libro: string;
  grupo: GrupoDeidad;
  circulo: string | null;        // solo infernales: "Primer Círculo Infernal"…
  alineamiento: string;          // abreviatura del libro
  alineamiento_nombre: string;
  virtudes: string[];
  descripcion: string;
  simbolo: string;               // "img/deidades/<id>.webp"
  pagina: number;
}
