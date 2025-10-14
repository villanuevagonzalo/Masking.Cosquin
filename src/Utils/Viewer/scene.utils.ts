import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import { MathUtils, Vector3 } from "three";
import { Sky } from "three/examples/jsm/Addons.js";

export const sceneInit = (
	world: OBC.SimpleWorld<any, any, any>,
	components: OBC.Components, 
	container: HTMLElement
): void => {

	world.scene = new OBC.SimpleScene(components);
	world.renderer = new OBCF.PostproductionRenderer(components, container);
	world.camera = new OBC.OrthoPerspectiveCamera(components);

	//(world.camera as OBC.OrthoPerspectiveCamera).mode.set("Orbit");

	components.init();

	world.renderer.postproduction.enabled = true;

	world.scene.setup();
	world.scene.three.background = null;

	/*const sky = new Sky();
sky.scale.setScalar( 450000 );

const phi = MathUtils.degToRad( 90 );
const theta = MathUtils.degToRad( 180 );
const sunPosition = new Vector3().setFromSphericalCoords( 1, phi, theta );

	sky.material.uniforms["sunPosition"].value = sunPosition;

world.scene.add( sky );
*/
	const grids = components.get(OBC.Grids);
	const grid = grids.create(world);
	grid.config.color.set(0x666666);


}