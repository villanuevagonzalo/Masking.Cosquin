import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBCF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";

const highlightMaterial: FRAGS.MaterialDefinition = {
    color: new THREE.Color("gold"),
    renderedFaces: FRAGS.RenderedFaces.TWO,
    opacity: 1,
    transparent: false,
};

export const highlighterInit = (
world: OBC.SimpleWorld<any, any, any>, components: OBC.Components, fragmentsManager: OBC.FragmentsManager): OBCF.Highlighter => {

    //world.camera.controls.camera.position

    const highlighter = components.get(OBCF.Highlighter);
    highlighter.setup({ world, selectMaterialDefinition: highlightMaterial });

    highlighter.events["select"].onClear.add(() => {
        console.log("Selection was cleared");
    });

    return highlighter;

}