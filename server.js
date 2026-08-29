import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import healthRoutes from './server/routes/health.js';
import reposRoutes from './server/routes/repos.js';
import catalogRoutes from './server/routes/catalog.js';
import briefingRoutes from './server/routes/briefing.js';
import chatRoutes from './server/routes/chat.js';
import telemetryRoutes from './server/routes/telemetry.js';
import { setupVite } from './server/middleware/viteSetup.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', healthRoutes);
app.use('/api', reposRoutes);
app.use('/api', catalogRoutes);
app.use('/api', briefingRoutes);
app.use('/api', chatRoutes);
app.use('/api', telemetryRoutes);

// Configuração do Vite middleware ou arquivos estáticos
await setupVite(app);

app.listen(PORT, () => {
  console.log(`[EL SHANDAY BACKEND]: Servidor rodando em http://localhost:${PORT}`);
});
