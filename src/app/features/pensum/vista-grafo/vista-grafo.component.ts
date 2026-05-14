import {
  Component, inject, OnInit, OnDestroy,
  ElementRef, ViewChild, signal, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { PensumService } from '../../../core/services/pensum.service';
import { AuthService } from '../../../core/services/auth.service';
import { MateriaEstadoDTO } from '../../../models/materia-estado.dto';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ModalNotaComponent } from '../modal-nota/modal-nota.component';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  materia: MateriaEstadoDTO;
  x?: number;
  y?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode | string;
  target: GraphNode | string;
}

@Component({
  selector: 'app-vista-grafo',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, ModalNotaComponent],
  template: `
    <div class="p-4 sm:p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-white font-display text-lg">Grafo de Dependencias</h2>
          <p class="text-slate-500 text-sm">
            Visualización del DAG — arrastra los nodos para reorganizar
          </p>
        </div>
        <div class="flex items-center gap-4 text-xs text-slate-500">
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full bg-aprobada inline-block"></span> Aprobada
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full bg-disponible inline-block"></span> Disponible
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full bg-slate-600 inline-block"></span> Bloqueada
          </span>
        </div>
      </div>

      <!-- Spinner -->
      <app-spinner *ngIf="pensum.loading()" />

      <!-- Graph container -->
      <div *ngIf="!pensum.loading()" class="card overflow-hidden relative" style="height: 600px;">
        <svg #svgEl class="w-full h-full"></svg>

        <!-- Tooltip -->
        <div
          *ngIf="tooltip()"
          class="absolute z-10 pointer-events-none bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl text-sm max-w-xs"
          [style.left.px]="tooltip()!.x"
          [style.top.px]="tooltip()!.y"
        >
          <p class="text-white font-medium mb-1">{{ tooltip()!.nombre }}</p>
          <p class="text-slate-400 text-xs font-mono mb-2">{{ tooltip()!.codigo }}</p>
          <div class="flex items-center gap-2">
            <span class="text-xs" [class]="tooltipEstadoClass()">
              {{ tooltip()!.estado }}
            </span>
            <span class="text-slate-500 text-xs">{{ tooltip()!.creditos }} cr.</span>
          </div>
          <div *ngIf="tooltip()!.prereqs.length > 0" class="mt-2 pt-2 border-t border-slate-700">
            <p class="text-[10px] text-slate-500 mb-1">Prerrequisitos:</p>
            <p class="text-[10px] text-slate-400">{{ tooltip()!.prereqs.join(', ') }}</p>
          </div>
          <p *ngIf="tooltip()!.estado !== 'BLOQUEADA'" class="text-[10px] text-slate-600 mt-2">
            Clic para registrar nota
          </p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <app-modal-nota
      *ngIf="materiaSeleccionada()"
      [materia]="materiaSeleccionada()!"
      (cerrar)="cerrarModal()"
      (guardado)="onGuardado()"
    />
  `,
})
export class VistaGrafoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('svgEl', { static: false }) svgRef!: ElementRef<SVGSVGElement>;

  pensum = inject(PensumService);
  private auth = inject(AuthService);

  materiaSeleccionada = signal<MateriaEstadoDTO | null>(null);
  tooltip = signal<{
    x: number;
    y: number;
    nombre: string;
    codigo: string;
    estado: string;
    creditos: number;
    prereqs: string[];
  } | null>(null);

  private simulation?: d3.Simulation<GraphNode, GraphLink>;
  private initialized = false;

  ngOnInit() {
    const id = this.auth.estudianteId();
    if (id && this.pensum.materias().length === 0) {
      this.pensum.cargarPensum(id).subscribe(() => {
        if (this.initialized) this.buildGraph();
      });
    }
  }

  ngAfterViewInit() {
    this.initialized = true;
    if (this.pensum.materias().length > 0) {
      setTimeout(() => this.buildGraph(), 100);
    } else {
      const unsub = setInterval(() => {
        if (this.pensum.materias().length > 0) {
          clearInterval(unsub);
          setTimeout(() => this.buildGraph(), 100);
        }
      }, 200);
    }
  }

  ngOnDestroy() {
    this.simulation?.stop();
  }

  tooltipEstadoClass(): string {
    return (
      {
        APROBADA: 'text-aprobada',
        DISPONIBLE: 'text-disponible',
        MATRICULADA: 'text-blue-400',
        REPROBADA: 'text-red-400',
        BLOQUEADA: 'text-slate-500',
      }[this.tooltip()?.estado ?? 'BLOQUEADA'] ?? 'text-slate-500'
    );
  }

  private buildGraph() {
    const materias = this.pensum.materias();
    if (!materias.length || !this.svgRef) return;

    const el = this.svgRef.nativeElement;
    const W = el.clientWidth || 900;
    const H = el.clientHeight || 600;

    d3.select(el).selectAll('*').remove();

    // Build nodes and links from prerrequisitosNombres
    const nodes: GraphNode[] = materias.map((m) => ({ id: m.id, materia: m }));
    const nodeByName = new Map(materias.map((m) => [m.nombre, m]));

    const links: GraphLink[] = [];
    materias.forEach((m) => {
      m.prerrequisitosNombres.forEach((preNombre) => {
        const pre = nodeByName.get(preNombre);
        if (pre) links.push({ source: pre.id, target: m.id });
      });
    });

    const svg = d3.select(el);

    // Arrow marker
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 22)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M2 1L8 5L2 9')
      .attr('fill', 'none')
      .attr('stroke', '#3A4A6B')
      .attr('stroke-width', 1.5);

    const g = svg.append('g');

    // Zoom
    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 2])
        .on('zoom', ({ transform }) => g.attr('transform', transform)),
    );

    // Links
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', (d) => {
        const src = materias.find((m) => m.id === (d.source as GraphNode).id || m.id === d.source);
        return src?.estado === 'APROBADA' ? 'link link-aprobada' : 'link';
      })
      .attr('marker-end', 'url(#arrow)');

    // Nodes
    const node = g
      .append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .join('g')
      .style('cursor', (d) => (d.materia.estado !== 'BLOQUEADA' ? 'pointer' : 'default'))
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) this.simulation!.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) this.simulation!.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    // Node circles
    node
      .append('circle')
      .attr('r', (d) => 14 + d.materia.creditos * 1.5)
      .attr(
        'fill',
        (d) =>
          ({
            APROBADA: '#064E3B',
            DISPONIBLE: '#78350F',
            MATRICULADA: '#1e3a5f',
            REPROBADA: '#450a0a',
            BLOQUEADA: '#1A2236',
          })[d.materia.estado] ?? '#1A2236',
      )
      .attr(
        'stroke',
        (d) =>
          ({
            APROBADA: '#10B981',
            DISPONIBLE: '#F59E0B',
            MATRICULADA: '#3b82f6',
            REPROBADA: '#ef4444',
            BLOQUEADA: '#3A4A6B',
          })[d.materia.estado] ?? '#3A4A6B',
      )
      .attr('stroke-width', (d) => (d.materia.estado === 'DISPONIBLE' ? 2 : 1));

    // Semester label inside circle
    node
      .append('text')
      .text((d) => `S${d.materia.semestre}`)
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('font-size', '9px')
      .attr('fill', (d) => (d.materia.estado === 'BLOQUEADA' ? '#475569' : '#94a3b8'))
      .attr('font-family', 'DM Sans, sans-serif');

    // Credits label
    node
      .append('text')
      .text((d) => `${d.materia.creditos}cr`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.9em')
      .attr('font-size', '8px')
      .attr('fill', d => ({
        APROBADA:    '#10B981',
        DISPONIBLE:  '#F59E0B',
        MATRICULADA: '#3b82f6',
        REPROBADA:   '#ef4444',
        BLOQUEADA:   '#3A4A6B',
      }[d.materia.estado] ?? '#3A4A6B'))
      .attr('font-family', 'DM Sans, sans-serif');

    // Name below node
    node
      .append('text')
      .text((d) =>
        d.materia.nombre.length > 16 ? d.materia.nombre.substring(0, 14) + '…' : d.materia.nombre,
      )
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => 14 + d.materia.creditos * 1.5 + 14 + 'px')
      .attr('font-size', '10px')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'DM Sans, sans-serif');

    // Tooltip events
    node
      .on('mouseenter', (event, d) => {
        const rect = el.getBoundingClientRect();
        this.tooltip.set({
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top - 10,
          nombre: d.materia.nombre,
          codigo: d.materia.codigo,
          estado: d.materia.estado,
          creditos: d.materia.creditos,
          prereqs: d.materia.prerrequisitosNombres,
        });
      })
      .on('mousemove', (event) => {
        const rect = el.getBoundingClientRect();
        const t = this.tooltip();
        if (t)
          this.tooltip.set({
            ...t,
            x: event.clientX - rect.left + 12,
            y: event.clientY - rect.top - 10,
          });
      })
      .on('mouseleave', () => this.tooltip.set(null))
      .on('click', (_, d) => {
        if (d.materia.estado !== 'BLOQUEADA') {
          this.materiaSeleccionada.set(d.materia);
        }
      });

    // Simulation — layered by semester
    this.simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(100)
          .strength(0.8),
      )
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force(
        'y',
        d3.forceY<GraphNode>((d) => (d.materia.semestre / 9) * H * 0.8 + H * 0.1).strength(0.5),
      )
      .force('x', d3.forceX(W / 2).strength(0.05))
      .force(
        'collision',
        d3.forceCollide<GraphNode>((d) => 14 + d.materia.creditos * 1.5 + 10),
      )
      .on('tick', () => {
        link
          .attr('x1', (d) => (d.source as GraphNode).x!)
          .attr('y1', (d) => (d.source as GraphNode).y!)
          .attr('x2', (d) => (d.target as GraphNode).x!)
          .attr('y2', (d) => (d.target as GraphNode).y!);
        node.attr('transform', (d) => `translate(${d.x},${d.y})`);
      });
  }

  cerrarModal() {
    this.materiaSeleccionada.set(null);
  }

  onGuardado() {
    this.cerrarModal();
    const id = this.auth.estudianteId();
    if (id) this.pensum.cargarPensum(id).subscribe(() => this.buildGraph());
  }
}
