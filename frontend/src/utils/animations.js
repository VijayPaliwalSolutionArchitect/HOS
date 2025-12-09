import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Animate text with staggered reveal effect
 * @param {string} selector - CSS selector for target elements
 * @param {Object} options - Animation options
 */
export const animateTextReveal = (selector, options = {}) => {
  const defaults = {
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    y: 50,
    opacity: 0,
  };
  
  const settings = { ...defaults, ...options };
  
  return gsap.from(selector, {
    y: settings.y,
    opacity: settings.opacity,
    duration: settings.duration,
    stagger: settings.stagger,
    ease: settings.ease,
  });
};

/**
 * Animate elements with scroll trigger
 * @param {string} selector - CSS selector for target elements
 * @param {Object} options - Animation and ScrollTrigger options
 */
export const animateOnScroll = (selector, options = {}) => {
  const defaults = {
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: selector,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
    },
  };
  
  const settings = { ...defaults, ...options };
  
  return gsap.from(selector, settings);
};

/**
 * Create a parallax effect on scroll
 * @param {string} selector - CSS selector for target element
 * @param {Object} options - Parallax options
 */
export const parallaxEffect = (selector, options = {}) => {
  const defaults = {
    y: -100,
    ease: 'none',
    scrollTrigger: {
      trigger: selector,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  };
  
  const settings = { ...defaults, ...options };
  
  return gsap.to(selector, settings);
};

/**
 * Fade in animation
 * @param {string} selector - CSS selector for target elements
 * @param {Object} options - Animation options
 */
export const fadeIn = (selector, options = {}) => {
  const defaults = {
    opacity: 0,
    duration: 1,
    ease: 'power2.out',
  };
  
  const settings = { ...defaults, ...options };
  
  return gsap.from(selector, settings);
};

/**
 * Scale in animation
 * @param {string} selector - CSS selector for target elements
 * @param {Object} options - Animation options
 */
export const scaleIn = (selector, options = {}) => {
  const defaults = {
    scale: 0.8,
    opacity: 0,
    duration: 0.6,
    ease: 'back.out(1.7)',
  };
  
  const settings = { ...defaults, ...options };
  
  return gsap.from(selector, settings);
};

/**
 * Stagger animation for multiple elements
 * @param {string} selector - CSS selector for target elements
 * @param {Object} options - Animation options
 */
export const staggerAnimation = (selector, options = {}) => {
  const defaults = {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
  };
  
  const settings = { ...defaults, ...options };
  
  return gsap.from(selector, settings);
};

/**
 * Create a timeline animation
 * @returns {gsap.core.Timeline} GSAP timeline
 */
export const createTimeline = () => {
  return gsap.timeline();
};

/**
 * Hover animation utility
 * @param {HTMLElement} element - Target element
 * @param {Object} hoverState - Hover state properties
 * @param {Object} options - Animation options
 */
export const hoverAnimation = (element, hoverState = {}, options = {}) => {
  const defaults = {
    duration: 0.3,
    ease: 'power2.out',
  };
  
  const settings = { ...defaults, ...options };
  
  return gsap.to(element, {
    ...hoverState,
    ...settings,
  });
};
