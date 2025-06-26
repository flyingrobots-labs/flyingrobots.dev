# Feature: Post-Processing Effects

## Overview
The post-processing effects system enhances the visual quality of the 3D scene with multiple shader-based effects including bloom, radial blur, and chromatic aberration. These effects create the distinctive cyberpunk aesthetic of the portfolio.

## Status
- **Current State**: Implemented
- **Version**: 1.0.0
- **Last Updated**: 2025-01-06
- **Priority**: High

## Technical Details

### Visual Concepts

#### Post-Processing Pipeline Flow
![Post-Processing Pipeline](../images/post-processing-pipeline.svg)

### Architecture
```
PostProcessing
├── EffectComposer (Three.js)
├── RenderPass (Base scene)
├── UnrealBloomPass (Glow effects)
├── ShaderPass (Custom effects)
│   ├── Radial Blur
│   └── Chromatic Aberration
└── OutputPass (Final output)
```

### Implementation
Located in `src/components/PostProcessing.js`:

```javascript
export function setupPostProcessing(renderer, scene, camera) {
    const composer = new EffectComposer(renderer);
    
    // Base scene render
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom for cyberpunk glow
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.6,  // strength
        0.8,  // radius
        0.85  // threshold
    );
    
    // Custom shader effects
    const radialBlurPass = new ShaderPass(RadialBlurShader);
    const chromaticAberrationPass = new ShaderPass(ChromaticAberrationShader);
}
```

### Effect Parameters

#### Bloom Effect
- **Strength**: 0.6 - Controls glow intensity
- **Radius**: 0.8 - Blur radius for glow spread
- **Threshold**: 0.85 - Luminance threshold for bloom

#### Radial Blur
- **Strength**: 0.035 - Blur intensity from center
- **Center**: (0.5, 0.5) - Screen space center point

#### Chromatic Aberration
- **Amplitude**: 0.0015 - Color channel separation
- **Distance-based**: Increases toward screen edges

## Performance Considerations

### Current Optimizations
1. **Resolution Scaling**: Effects run at lower resolution
2. **Conditional Rendering**: Effects can be toggled
3. **Frame Rate Adaptive**: Reduces quality at low FPS

### Performance Impact
- **Desktop**: ~5-10ms additional render time
- **Mobile**: ~15-20ms additional render time
- **GPU Memory**: ~50MB for render targets

## Visual Design

### Aesthetic Goals
1. **Cyberpunk Atmosphere**: Neon glow and digital artifacts
2. **Depth Enhancement**: Blur creates depth perception
3. **Motion Feel**: Radial blur suggests movement
4. **Tech Aesthetic**: Chromatic aberration adds digital feel

### Color Grading
- Enhanced blues and purples
- Reduced mid-tones
- Increased contrast

## Configuration

### User Controls
Currently no direct user controls; effects are always on.

### Developer Settings
```javascript
// In PostProcessing.js
const BLOOM_PARAMS = {
    strength: 0.6,
    radius: 0.8,
    threshold: 0.85
};

const RADIAL_BLUR_STRENGTH = 0.035;
const CHROMATIC_ABERRATION_AMOUNT = 0.0015;
```

## Future Enhancements

### Planned Features
1. **Dynamic Quality Adjustment**: Auto-adjust based on performance
2. **User Preferences**: Allow users to toggle effects
3. **Additional Effects**:
   - Screen space reflections
   - Depth of field
   - Motion blur
4. **HDR Pipeline**: True HDR rendering support

### Optimization Opportunities
1. **Temporal Upsampling**: Render effects at 1/4 resolution
2. **Effect LOD**: Reduce effect complexity at distance
3. **Mobile-Specific Pipeline**: Lighter effects for mobile

## Dependencies
- Three.js EffectComposer
- Three.js UnrealBloomPass
- Custom shader implementations

## Testing Considerations

### Visual Testing
1. Compare screenshots across devices
2. Verify effect consistency
3. Check performance impact

### Performance Testing
1. Measure frame time with/without effects
2. Monitor GPU memory usage
3. Test on various hardware

## Known Issues
1. **Mobile Performance**: Can cause frame drops on older devices
2. **Color Accuracy**: Chromatic aberration can affect UI readability
3. **Bloom Bleeding**: Bright UI elements may glow unintentionally

## Test Status
- **Tests Written**: Yes (6 tests)
- **Test Coverage**: ~40%
- **Status**: Tests written but some are failing. Includes visual regression tests for post-processing effects, performance impact tests, and effect parameter validation tests.

## References
- [Three.js Post-Processing](https://threejs.org/docs/#examples/en/postprocessing/EffectComposer)
- [Bloom Implementation](https://learnopengl.com/Guest-Articles/2022/Phys.-Based-Bloom)
- [Chromatic Aberration in Games](https://www.adriancourreges.com/blog/2016/09/09/doom-2016-graphics-study/)