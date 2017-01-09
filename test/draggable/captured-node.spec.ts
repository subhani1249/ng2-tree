import { ElementRef } from '@angular/core';

import { NodeDraggableService } from '../../src/draggable/node-draggable.service';
import { CapturedNode } from '../../src/draggable/captured-node';
import { NodeDraggableEvent } from '../../src/draggable/draggable.types';
import { TreeModel } from '../../src/tree.types';

describe('Captured Node', () => {
  it('should be created with element and tree', () => {
    const element: ElementRef = {} as ElementRef;
    const tree: TreeModel = { value: "42" };

    const capturedNode = new CapturedNode(element, tree);

    expect(capturedNode.element).toBe(element);
    expect(capturedNode.tree).toBe(tree);
  });

  it('should know how to compare elements', () => {
    const element: ElementRef = {} as ElementRef;
    const element2: ElementRef = {} as ElementRef;
    const tree: TreeModel = null;

    const capturedNode = new CapturedNode(element, tree);

    expect(capturedNode.sameAs(element)).toBe(true);
    expect(capturedNode.sameAs(element2)).toBe(false);
  });

  it('should know whether another element is not a child of current element', () => {
    const contains = jasmine.createSpy('contains').and.returnValue(false);
    const thisNativeElement = {
      contains
    }

    const element: ElementRef = {
      nativeElement: thisNativeElement
    } as ElementRef;

    const element2: ElementRef = {
      nativeElement: {}
    } as ElementRef;

    const capturedNode = new CapturedNode(element, null);

    expect(capturedNode.contains(element2)).toBe(false);
    expect(contains).toHaveBeenCalledWith(element2.nativeElement);
  });

  it('should know whether another element is a child of current element', () => {
    const contains = jasmine.createSpy('contains').and.returnValue(true);
    const thisNativeElement = {
      contains
    }

    const element: ElementRef = {
      nativeElement: thisNativeElement
    } as ElementRef;

    const element2: ElementRef = {
      nativeElement: {}
    } as ElementRef;

    const capturedNode = new CapturedNode(element, null);

    expect(capturedNode.contains(element2)).toBe(true);
    expect(contains).toHaveBeenCalledWith(element2.nativeElement);
  });

  it('should be possible to drop node on element that is not element of current node', () => {
    const contains = jasmine.createSpy('contains').and.returnValue(false);
    const thisNativeElement = {
      contains
    }

    const element: ElementRef = {
      nativeElement: thisNativeElement
    } as ElementRef;

    const element2: ElementRef = {
      nativeElement: {}
    } as ElementRef;

    const capturedNode = new CapturedNode(element, null);
    expect(capturedNode.canBeDroppedAt(element2)).toBe(true);
    expect(contains).toHaveBeenCalledWith(element2.nativeElement);
  });

  it('should not be possible to drop node on itself', () => {
    const contains = jasmine.createSpy('contains').and.returnValue(true);
    const thisNativeElement = {
      contains
    }

    const element: ElementRef = {
      nativeElement: thisNativeElement
    } as ElementRef;

    const capturedNode = new CapturedNode(element, null);

    expect(capturedNode.canBeDroppedAt(element)).toBe(false);
    expect(contains).not.toHaveBeenCalled();
  });

  it('should not be possible to drop node on its child', () => {
    const contains = jasmine.createSpy('contains').and.returnValue(true);
    const thisNativeElement = {
      contains
    }

    const element: ElementRef = {
      nativeElement: thisNativeElement
    } as ElementRef;

    const element2: ElementRef = {
      nativeElement: {}
    } as ElementRef;

    const capturedNode = new CapturedNode(element, null);

    expect(capturedNode.canBeDroppedAt(element2)).toBe(false);
    expect(thisNativeElement.contains).toHaveBeenCalledWith(element2.nativeElement);
  });
});