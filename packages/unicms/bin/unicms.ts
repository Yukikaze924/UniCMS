#!/usr/bin/env node

import { ensureEnvVariables } from '@/lib/util/env';
import { config } from 'dotenv';

config();

ensureEnvVariables();

import("../src/cli");
