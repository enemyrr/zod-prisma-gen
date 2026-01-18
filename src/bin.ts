#!/usr/bin/env node
import { generatorHandler } from '@prisma/generator-helper';
import { onManifest, onGenerate } from './generator';

generatorHandler({
  onManifest,
  onGenerate,
});
