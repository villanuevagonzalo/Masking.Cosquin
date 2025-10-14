import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";

export const initFragmentsModels = (components: OBC.Components): OBC.FragmentsManager => {

    const workerUrl = 'assets/fragments/worker.mjs';
    const fragments = components.get(OBC.FragmentsManager);
    fragments.init(workerUrl);

    return fragments;
}


export const convertIFCArrayBuffertoFragmentBytes = async (arrayBuffer: ArrayBuffer): Promise<ArrayBuffer> => {

    const serializer = new FRAGS.IfcImporter();
    serializer.wasm = { absolute: true, path: '/assets/web-ifc/' };

    const ifcBytes = new Uint8Array(arrayBuffer);
    const fragmentBytes = (await serializer.process({ bytes: ifcBytes })).buffer as ArrayBuffer;
    
    return fragmentBytes;
}

export const convertIFCFiletoFragmentBytes = async (file: File): Promise<ArrayBuffer> => {

    return convertIFCArrayBuffertoFragmentBytes(await file.arrayBuffer());

}

export const convertIFCPathtoFragmentBytes = async (filePath: string): Promise<ArrayBuffer> => {

    const ifcFile = await fetch(filePath);
    const ifcBuffer = await ifcFile.arrayBuffer();
    
    return convertIFCArrayBuffertoFragmentBytes(ifcBuffer);
    
}