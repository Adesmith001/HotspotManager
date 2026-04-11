import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';

import {PremiumGate} from '../PremiumGate';

describe('PremiumGate', () => {
  it('shows lock when premium is false', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <PremiumGate premium={false}>
          <Text>Premium Content</Text>
        </PremiumGate>,
      );
    });
    const textNodes = tree!.root.findAllByType(Text);
    expect(textNodes.map(node => node.props.children).join(' ')).toContain(
      'Premium required',
    );
  });
});
