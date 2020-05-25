import anime from "animejs";

const particlesOffSets = {
    left: {
        big: 0,
        medium: 0,
        small: 0,
    },
    right: {
        big: 1030 ,
        medium: 1220,
        small: 1350,
    },
}

const playAnimationTo = (position) => {
    const offsets = particlesOffSets[position]
    const timeline = anime.timeline({
        duration: 3000,
        easing: 'easeOutElastic(1, 10)'
    })
    Object.keys(offsets).forEach((key, idx) => {
        timeline.add({
            targets: `.particle.${key}`,
            translateX: offsets[key],
        }, 75 * idx)
    })
}

export default playAnimationTo

