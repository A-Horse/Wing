import * as path from 'path';
import * as R from 'ramda';
import { Category } from './Category';
import { RenderController } from '../modules/render/render-controller';
import { getRelativePath } from '../lib/util';
import { RenderEntity } from './RenderEntity';

export class CategoryList implements RenderEntity {
  private data: CategoryListData;

  constructor(
    private options: {
      categoryListOutputPath: string;
      blogInputPath: string;
      blogOutputPath: string;
    },
    private categorys: Category[],
    private controller: RenderController
  ) {}

  public load(): void {
    this.data = this.loadCategoryListData();
  }

  public getData() {
    return this.data;
  }

  private loadCategoryListData(): CategoryListData {
    return {
      categoryList: this.categorys.map(c => c.getData()).map(cd => R.omit(['articles'], cd)),
      path: getRelativePath(this.options.blogOutputPath, this.options.categoryListOutputPath)
    };
  }

  public render() {
    if (!this.controller.reader.existsSync(this.options.categoryListOutputPath)) {
      this.controller.writer.mkdirSync(this.options.categoryListOutputPath);
    }

    const html = this.controller.renderThemer.renderTemplate('CATEGORY_LIST', this.data);
    this.controller.writer.writeFileSync(path.join(this.options.categoryListOutputPath, 'index.html'), html);

    this.controller.renderPluginManager.runPluinAfterCategoryListRender(html, this);
  }
}
