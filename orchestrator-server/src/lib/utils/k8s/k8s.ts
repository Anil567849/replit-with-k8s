import fs from "fs";
import yaml from "yaml";
import { KubeConfig, AppsV1Api, CoreV1Api, NetworkingV1Api } from "@kubernetes/client-node";

export const initK8s = () => {
    const kubeconfig = new KubeConfig();
    kubeconfig.loadFromDefault();
    const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
    const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
    const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);
    return {coreV1Api, appsV1Api, networkingV1Api};
}

// Updated utility function to handle multi-document YAML files
export const readAndParseKubeYaml = (filePath: string, replId: string): Array<any> => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const docs = yaml.parseAllDocuments(fileContent).map((doc: any) => {
        let docString = doc.toString();
        const regex = new RegExp(`service_name`, 'g');
        docString = docString.replace(regex, replId);
        console.log(docString);
        return yaml.parse(docString);
    });
    return docs;
};