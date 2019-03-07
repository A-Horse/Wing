import * as ora from 'ora';
import * as rimraf from 'rimraf';
import { isDir } from '../lib/util';
import { RenderController } from '../modules/render/render-controller';
import { Command } from './command';
import printer from '../util/printer';
import { BlogReader } from '../modules/reader/BlogReader';
import { FSBlogReader } from '../modules/reader/FSBlogReader';

export default class RenderCommand implements Command {
  public name = 'render';
  public type = 'command';
  private spinner;

  public run(inputs: string[], flags: boolean[], blogConfigure: BlogConfigure): void {
    const inputPath = inputs[0];
    if (!inputPath) {
      return console.error('Please spec blog path.');
    }

    if (!isDir(inputPath)) {
      // TODO log it
      return;
    }

    const outputPath = 'build';

    this.cleanOutPutAssets(outputPath).then(() => {
      this.startSpin();

      try {
        const reader: BlogReader = new FSBlogReader();
        const renderControl = new RenderController(inputPath, outputPath, blogConfigure, reader);
        renderControl.render();

        this.stopSpinSuccess();
      } catch (error) {
        console.error(error);
        this.stopSpinFail();
      }

      this.logCurrentTime();
    });
  }

  private startSpin() {
    this.spinner = ora('Start render...').start();
  }

  private stopSpinSuccess() {
    this.spinner.succeed('Render completion...');
  }

  private stopSpinFail() {
    this.spinner.fail('Build Fail...');
  }

  private cleanOutPutAssets(outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      rimraf(outputPath, (error: Error) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }

  private logCurrentTime() {
    let date = new Date();
    printer.log(`Time: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
  }
}
