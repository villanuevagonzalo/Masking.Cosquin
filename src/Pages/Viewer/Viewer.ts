import { Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import { BoundingBoxer } from '@thatopen/components';
import { Box3, Vector3} from 'three';

import { IfcViewerContext } from "../../Utils/Viewer/IfcViewerContext";

@Component({
  selector: '#container',
  templateUrl: './Viewer.html',
  styleUrl: './Viewer.scss'
})

export class Viewer implements OnInit{
  
  @ViewChild('container', { static: true }) _container!: ElementRef;
  
  protected viewerContext = new IfcViewerContext();

  private boxer!: BoundingBoxer;
  private boundingBox!: Box3;
  private size!: Vector3;
  private center!: Vector3;
  public rotate = false;
  angle = 0;
  timer: any;

  
  constructor(private ngZone: NgZone) {}
  
  async ngOnInit(): Promise<void> {
    
    // Init Viewer Context
    await this.viewerContext.init(this._container.nativeElement, {
      background: '#0f0f0f',
      dynamicAnchor: false,
    });

    await this.viewerContext.loadModel('assets/model.ifc');
    
    this.boxer = this.viewerContext.components.get(BoundingBoxer);
    this.boxer.addFromModels();
    this.boundingBox = this.boxer.get();
    this.size = this.boundingBox.getSize(new Vector3());
    this.center = this.boundingBox.getCenter(new Vector3());
    this.boxer.dispose();
    this.animate();

    //this.toggleRotate();

  }

  toggleRotate = () => {
    this.rotate = !this.rotate;

    if(this.rotate){
      this.ngZone.runOutsideAngular(() => {
        this.timer = setInterval(() => {
          this.ngZone.run(() => {
            this.animate();
          });
        }, 100);
    });
    } else{
      clearInterval(this.timer);
      this.timer = null; // Clear the interval ID
    }
  }
  
  animate() {
             // o deg2rad(this.angle)
    const r = Math.max(this.size.x, this.size.y, this.size.z) + 1;

    const cx = this.center.x;
    const cy = this.center.y;
    const cz = this.center.z;

    // si querés mantener la altura fija en el centro:
    const ey = cy + 10; // o cy + offset si querés más alto

    const ex = cx + Math.cos(this.angle) * r;
    const ez = cz + Math.sin(this.angle) * r;

    this.viewerContext.world.camera.controls?.setLookAt(
      ex, ey, ez,   // eye
      cx, cy, cz,   // target
      true,
    );

    this.angle += 0.015;
  }

  async dispatchClick(event: MouseEvent): Promise<void> {
    //this.toggleRotate();
  }
  

  
}