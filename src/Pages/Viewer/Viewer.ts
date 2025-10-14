import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";

import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { convertIFCFiletoFragmentBytes, convertIFCPathtoFragmentBytes, initFragmentsModels } from "../../Utils/IfcUtils";

import { sceneInit } from "../../Utils/Viewer/scene.utils";
import { highlighterInit } from "../../Utils/Viewer/highlighter.utils";

@Component({
  selector: '#container',
  imports: [JsonPipe],
  templateUrl: './Viewer.html',
  styleUrl: './Viewer.scss'
})

export class Viewer implements AfterViewInit{
  
  readonly rendererContainer = viewChild<ElementRef<HTMLDivElement>>('rendererContainer'); 

  // General World definition

  private components = new OBC.Components();
  private worlds = this.components.get(OBC.Worlds);
  private world = this.worlds.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBCF.PostproductionRenderer>()

  private fragmentsManager: OBC.FragmentsManager = initFragmentsModels(this.components);
  private currentModel: FRAGS.FragmentsModel | undefined = undefined;

  
  private boxer = this.components.get(OBC.BoundingBoxer);


  // Viewer Functions

  private loadModel = async(ifcPath:string): Promise<void> => {
  
    const fragmentBytes:ArrayBuffer = await convertIFCPathtoFragmentBytes(ifcPath);
    if (!fragmentBytes) return;

    this.currentModel = await this.fragmentsManager.core.load(fragmentBytes, { modelId: "example" });
    if (!this.currentModel) return;

    this.currentModel.useCamera(this.world.camera.three);
    this.world.scene.three.add(this.currentModel.object);
    await this.fragmentsManager.core.update(true);
  }

  private loadModelFromFile = async (file: File): Promise<void> => {

    const fragmentBytes: ArrayBuffer = await convertIFCFiletoFragmentBytes(file);
    if (!fragmentBytes) return;

    this.currentModel = await this.fragmentsManager.core.load(fragmentBytes, { modelId: file.name });
    if (!this.currentModel) return;

    this.currentModel.useCamera(this.world.camera.three);
    this.world.scene.three.add(this.currentModel.object);
    await this.fragmentsManager.core.update(true);
    console.log(this.world)
    console.log(this.fragmentsManager)
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.loadModelFromFile(file);
  }

  //private highlighter = this.components.get(OBCF.Highlighter);
  //private outliner = this.components.get(OBCF.Outliner);




  localId: number | null = null;
  hoverId: number | null = null;

  itemData: FRAGS.ItemData[] | undefined = undefined;

  

  /*async getAttributes(): Promise<void>{
    if (!this.localId) return;
      this.itemData = await this.currentModel?.getItemsData([this.localId]);
  };

  async highlight(id: number): Promise<void>{
    await this.currentModel?.highlight([id], highlightMaterial);
    await this.getAttributes();
  };

  async resetHighlight(id: number): Promise<void>{
    await this.currentModel?.resetHighlight([id]);
  };


  async handleViewerClick(event: MouseEvent): Promise<void>{
    const mouse = new THREE.Vector2();
    mouse.x = event.clientX;
    mouse.y = event.clientY;

      const result = await this.currentModel?.raycast({
        camera: this.world.camera.three,
        mouse,
        dom: this.world.renderer!.three.domElement!,
      });


    console.log(result)

      const promises = [];
      if (result) {
        if(this.localId) this.resetHighlight(this.localId);
        this.localId = result.localId;
        this.highlight(result.localId);
      } else if(this.localId) {
        this.resetHighlight(this.localId);
        this.localId = null;
      }
      promises.push(this.fragmentsManager?.update(true));
      Promise.all(promises);
    
  }


*/
  async handleMouseOver(event: MouseEvent): Promise<void>{

    const mouse = new THREE.Vector2();
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    const result = await this.currentModel?.raycast({
      camera: this.world.camera.three,
      mouse,
      dom: this.world.renderer!.three.domElement!,
    });

    
    if (result){
      this.world.camera.controls.setOrbitPoint(result.point.x, result.point.y, result.point.z)
      if(result.localId!=this.hoverId) {

      this.hoverId = result.localId
      //this.createSphere(result.point)

      
     //this.world.camera.controls.setOrbitPoint(result.point.x, result.point.y, result.point.z);


      console.log(result)

      }

    } else{
      this.hoverId = null
    }
  }




  
  async ngAfterViewInit(): Promise<void> {

    sceneInit(this.world, this.components, this.rendererContainer()!.nativeElement);

    const highlighter = highlighterInit(this.world, this.components, this.fragmentsManager);

    
    highlighter.events["select"].onHighlight.add(async (modelIdMap) => {

      const test = await this.boxer.getCenter(modelIdMap);
      console.log()
    });



    /*await this.highlighter.setup({ 
      hoverName: "hover",
      //use the color you want to use as hover
      hoverColor: new THREE.Color(0xffffff),
      hoverEnabled: true,
      selectName: "select",
      //use the color you want to use as select
      selectionColor: new THREE.Color(0x0096FF),
      selectEnabled: true,
      autoHighlightOnClick: true,
      world: this.world
    });
    this.highlighter.zoomToSelection = true;

    this.outliner.create(
      "example",
      new THREE.MeshBasicMaterial({
        color: 0xbcf124,
        transparent: true,
        opacity: 0.5,
      }),
    );
    this.outliner.world = this.world;
    this.outliner.enabled = true;


    this.highlighter.events["select"].onHighlight.add((data) => {
      console.log(data)
      this.outliner.clear("example");
      this.outliner.add("example", data);
    });

    this.highlighter.events["select"].onClear.add(() => {
      this.outliner.clear("example");
    });*/


    //await this.loadModel("https://thatopen.github.io/engine_components/resources/small.ifc");
    //await this.loadModel("https://thatopen.github.io/engine_fragment/resources/ifc/school_str.ifc");

  }


  

  

  filter(): void {

    

    const material = new THREE.MeshLambertMaterial({ color: "#6528D7", transparent: true });
    const geometry = new THREE.BoxGeometry();
    const cube = new THREE.Mesh(geometry, material);
    this.world.scene.three.add(cube);
    
  }

  createCube(): void {

    

    const material = new THREE.MeshLambertMaterial({ color: "#6528D7", transparent: true });
    const geometry = new THREE.BoxGeometry();
    const cube = new THREE.Mesh(geometry, material);
    this.world.scene.three.add(cube);
    
  }

  createSphere(center: THREE.Vector3): void {

    const material = new THREE.MeshLambertMaterial({ color: "#6528D7", transparent: true });
    const geometry = new THREE.SphereGeometry(center.x, center.y, center.z);
    const cube = new THREE.Mesh(geometry, material);
    this.world.scene.three.add(cube);
    
  }
  
}