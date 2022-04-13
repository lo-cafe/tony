import 'regenerator-runtime/runtime';

import _theme from '~/constants/theme';

const WINDOW_WIDTH = 1280;
const WINDOW_HEIGHT = 800;

// jest.setTimeout(20000)

const theme = _theme();

describe('App', () => {
  beforeAll(async () => {
    await page.setViewport({ width: WINDOW_WIDTH, height: WINDOW_HEIGHT });
    await page.goto('http://localhost:3000/');
  });

  describe('Workspaces', () => {
    it('should add new workspace', async () => {
      await expect(
        (async () => {
          await page.click('[data-testid="add-workspace"]');
        })()
      ).resolves.not.toThrowError();
    });
  });

  describe('Chats', () => {
    it('should select chat', async () => {
      await expect(
        (async () => {
          await page.waitForSelector('[data-testid="chats-list"] > div');
          await page.click('[data-testid="chats-list"] > div');
        })()
      ).resolves.not.toThrowError();
    });
  });

  describe('Nodes', () => {
    it('should be created in the drop position.', async () => {
      const addCardNode = await page.waitForSelector('[data-testid="add-node-handler"]');
      const bounding_box = await addCardNode.boundingBox();
      await page.mouse.move(
        bounding_box.x + bounding_box.width - 10,
        bounding_box.y + bounding_box.height / 2
      );
      await page.mouse.down();
      await page.mouse.move(WINDOW_WIDTH / 2 + (bounding_box.width / 2 - 10), WINDOW_HEIGHT / 2);
      await page.waitForTimeout(theme.transitions.quick + 1);
      const addCardNodeBeforeDroppingDimensions = await page.evaluate(() => {
        const { x, y } = document
          .querySelector('[data-testid="add-node-handler"]')
          .getBoundingClientRect();
        return { x: x.toFixed(0), y: y.toFixed(0) };
      });
      await page.mouse.up();
      const addedCardNodeDimensions = await await page.evaluate(() => {
        const { x, y } = document.querySelector('.react-flow__nodes > *').getBoundingClientRect();
        return { x: x.toFixed(0), y: y.toFixed(0) };
      });
      expect(addedCardNodeDimensions).toMatchObject(addCardNodeBeforeDroppingDimensions);
    });

    it('should be selectable.', async () => {
      const addedCardNode = await page.waitForSelector('.react-flow__nodes > *');
      await addedCardNode.click();
      const sidePanel = await page.waitForSelector('[data-testid="side-panel"]');
      expect(sidePanel).toBeTruthy();
    });

    it('type should be changeble.', async () => {
      await expect(
        (async () => {
          const addedCardNode = await page.waitForSelector('.react-flow__nodes > *');
          const getCurrentNodeType = async () => {
            return await page.evaluate(() => {
              const element = document.querySelector(
                '.react-flow__nodes > * [data-testid="node-type"]'
              );
              return element && element.innerText; // will return undefined if the element is not found
            });
          };
          let currentNodeType = await getCurrentNodeType();
          expect(currentNodeType).toBe('Text');
          await page.click('[data-testid="answer-type"]');
          currentNodeType = await getCurrentNodeType();
          expect(currentNodeType).toBe('Answer');
          await page.click('[data-testid="condition-type"]');
          currentNodeType = await getCurrentNodeType();
          expect(currentNodeType).toBe('Condition');
          await page.click('[data-testid="text-type"]');
          currentNodeType = await getCurrentNodeType();
          expect(currentNodeType).toBe('Text');
        })()
      ).resolves.not.toThrowError();
    });

    it('should be deselectable.', async () => {
      await page.evaluate(() => {
        document.querySelector('.react-flow__pane.react-flow__container').click();
      });
      const sidePanel = await page.$('[data-testid="side-panel"]');
      expect(sidePanel).toBeFalsy();
    });

    it('should move properly.', async () => {
      const MOVE_TEST_X = -134;
      const MOVE_TEST_Y = -28;
      const node = await page.$('.react-flow__nodes > *');
      const nodeBB = await node.boundingBox();
      await page.mouse.move(nodeBB.x, nodeBB.y);
      await page.mouse.down();
      await page.mouse.move(nodeBB.x + MOVE_TEST_X, nodeBB.y + MOVE_TEST_Y);
      await page.mouse.up();
      const nodeAfterMoveBB = await node.boundingBox();
      expect({ x: nodeAfterMoveBB.x, y: nodeAfterMoveBB.y }).toMatchObject({
        x: nodeBB.x + MOVE_TEST_X,
        y: nodeBB.y + MOVE_TEST_Y,
      });
    });
  });
});
