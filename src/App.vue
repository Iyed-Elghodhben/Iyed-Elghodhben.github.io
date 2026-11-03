<script setup>
import AppNav from "./components/AppNav.vue";
import HeroSection from "./components/HeroSection.vue";
import AboutSection from "./components/AboutSection.vue";
import WorkSection from "./components/WorkSection.vue";
import SkillsSection from "./components/SkillsSection.vue";
import ExperienceSection from "./components/ExperienceSection.vue";
import ContactSection from "./components/ContactSection.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<template>
  <AppNav />
  <main id="main-content" tabindex="-1">
    <HeroSection />
    <AboutSection />
    <WorkSection />
    <SkillsSection />
    <ExperienceSection />
    <ContactSection />
  </main>
  <AppFooter />
</template>
