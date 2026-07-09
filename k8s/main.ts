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
        image: 'your-docker-registry/pinterest-backend:latest', // Replace with your actual backend image
        portNumber: 3000,
        resources: {
          cpu: { request: kplus.Cpu.millis(100), limit: kplus.Cpu.millis(500) },
          memory: { request: Size.mebibytes(128), limit: Size.mebibytes(512) },
        },
        envVariables: {
          NODE_ENV: kplus.EnvValue.fromValue('production'),
          // Add other required env vars here like DB connection strings
        }
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
        image: 'your-docker-registry/pinterest-client:latest', // Replace with your actual frontend image
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

    // Ingress to expose the app on abyandimas.me
    const ingress = new kplus.Ingress(this, 'AppIngress', {
      metadata: {
        name: 'pinterest-ingress',
        annotations: {
          'kubernetes.io/ingress.class': 'nginx',
          'cert-manager.io/cluster-issuer': 'letsencrypt-prod' // assuming cert-manager is used
        }
      }
    });

    // Add TLS configuration
    ingress.addTls([{
      hosts: ['abyandimas.me'],
      secret: kplus.Secret.fromSecretName(this, 'TlsSecret', 'abyandimas-tls-secret')
    }]);

    // Route /api to backend
    ingress.addHostRule('abyandimas.me', '/api', kplus.IngressBackend.fromService(backendService), kplus.HttpIngressPathType.PREFIX);

    // Route everything else to frontend
    ingress.addHostRule('abyandimas.me', '/', kplus.IngressBackend.fromService(frontendService), kplus.HttpIngressPathType.PREFIX);
  }
}

const app = new App();
new AppChart(app, 'pinterest-k8s');
app.synth();
