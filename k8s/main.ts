import { Construct } from 'constructs';
import { App, Chart, ChartProps, Size } from 'cdk8s';
import * as kplus from 'cdk8s-plus-27';

export class AppChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    // Create a Secret for Cloudflare Token and Zone ID
    const cloudflareSecret = new kplus.Secret(this, 'CloudflareSecret', {
      metadata: {
        name: 'cloudflare-api-token-secret'
      },
      stringData: {
        'api-token': process.env.CLOUDFLARE_API_TOKEN || 'your-cloudflare-token-here',
        'zone-id': process.env.CLOUDFLARE_ZONE_ID || 'your-zone-id-here'
      }
    });

    // Backend Deployment & Service
    const backendDeployment = new kplus.Deployment(this, 'BackendDeployment', {
      metadata: { name: 'backend' },
      containers: [{
        name: 'backend',
        image: `${process.env.DOCKERHUB_USERNAME || 'abyandimas'}/full-stack-pinterest-backend:${process.env.IMAGE_TAG || 'latest'}`,
        portNumber: 3000,
        resources: {
          cpu: { request: kplus.Cpu.millis(100), limit: kplus.Cpu.millis(500) },
          memory: { request: Size.mebibytes(128), limit: Size.mebibytes(512) },
        },
        envVariables: {
          NODE_ENV: kplus.EnvValue.fromValue('production'),
        },
        envFrom: [
          kplus.Env.fromSecret(kplus.Secret.fromSecretName(this, 'BackendSecret', 'backend-secrets'))
        ]
      }]
    });

    const backendService = backendDeployment.exposeViaService({
      name: 'backend-service',
      ports: [{ port: 3000, targetPort: 3000 }],
    });

    new kplus.HorizontalPodAutoscaler(this, 'BackendHpa', {
      target: backendDeployment,
      maxReplicas: 10,
      minReplicas: 1,
      metrics: [kplus.Metric.resourceCpu(kplus.MetricTarget.averageUtilization(70))]
    });

    // Frontend Deployment & Service
    const frontendDeployment = new kplus.Deployment(this, 'FrontendDeployment', {
      metadata: { name: 'frontend' },
      containers: [{
        name: 'frontend',
        image: `${process.env.DOCKERHUB_USERNAME || 'abyandimas'}/full-stack-pinterest-frontend:${process.env.IMAGE_TAG || 'latest'}`,
        portNumber: 80,
        resources: {
          cpu: { request: kplus.Cpu.millis(50), limit: kplus.Cpu.millis(250) },
          memory: { request: Size.mebibytes(64), limit: Size.mebibytes(256) },
        },
      }]
    });

    const frontendService = frontendDeployment.exposeViaService({
      name: 'frontend-service',
      ports: [{ port: 80, targetPort: 80 }],
    });

    new kplus.HorizontalPodAutoscaler(this, 'FrontendHpa', {
      target: frontendDeployment,
      maxReplicas: 5,
      minReplicas: 1,
      metrics: [kplus.Metric.resourceCpu(kplus.MetricTarget.averageUtilization(70))]
    });

    // Imgproxy External Service (Running in Docker Compose on the host)
    const imgproxyService = new kplus.Service(this, 'ImgproxyService', {
      type: kplus.ServiceType.EXTERNAL_NAME,
      externalName: '52.200.119.20',
      ports: [{ port: 8080 }]
    });

    // Ingress to expose the app using K3s default Traefik
    const ingress = new kplus.Ingress(this, 'AppIngress', {
      metadata: {
        name: 'pinterest-ingress',
        annotations: {
          'kubernetes.io/ingress.class': 'traefik'
        }
      }
    });

    // Route imgproxy.abyandimas.me to the external imgproxy service on port 8080
    // Note: CDK8s-plus HttpIngressPathType.PREFIX requires a backend service with a port
    // So we manually construct the Ingress backend for the external service
    ingress.addHostRule('imgproxy.abyandimas.me', '/', kplus.IngressBackend.fromService(imgproxyService, { port: 8080 }), kplus.HttpIngressPathType.PREFIX);

    // Route api.abyandimas.me to backend
    ingress.addHostRule('api.abyandimas.me', '/', kplus.IngressBackend.fromService(backendService), kplus.HttpIngressPathType.PREFIX);

    // Route pinterest.abyandimas.me to frontend
    ingress.addHostRule('pinterest.abyandimas.me', '/', kplus.IngressBackend.fromService(frontendService), kplus.HttpIngressPathType.PREFIX);
  }
}

const app = new App();
new AppChart(app, 'pinterest-k8s');
app.synth();
