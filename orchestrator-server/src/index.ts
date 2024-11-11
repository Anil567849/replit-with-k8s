import express, {Request, Response} from "express";
import path from "path";
import cors from "cors";
import { initK8s, readAndParseKubeYaml } from "./lib/utils/k8s/k8s";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3002;

const {coreV1Api, appsV1Api, networkingV1Api} = initK8s();

app.post("/start", async (req: Request, res: Response) => {
    const { userId, replId } = req.body; // Assume a unique identifier for each user
    const namespace = "default"; // Assuming a default namespace, adjust as needed

    try {
        const kubeManifests = readAndParseKubeYaml(path.join(__dirname, "../service.yaml"), replId);
        for (const manifest of kubeManifests) {
            switch (manifest.kind) {
                case "Deployment":
                    await appsV1Api.createNamespacedDeployment(namespace, manifest);
                    break;
                case "Service":
                    await coreV1Api.createNamespacedService(namespace, manifest);
                    break;
                case "Ingress":
                    await networkingV1Api.createNamespacedIngress(namespace, manifest);
                    break;
                default:
                    console.log(`Unsupported kind: ${manifest.kind}`);
            }
        }
        res.status(200).send({ message: "Resources created successfully" });
    } catch (error) {
        console.error("Failed to create resources", error);
        res.status(500).send({ message: "Failed to create resources" });
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
