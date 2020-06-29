# Domain Driven Design ⚡️ Light ⚡️ Component Framework for Node.js and TypeScript
[![License](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](https://github.com/Dionid/dddl/blob/master/LICENSE.md)

Domain Driven Design Light (DDDL) Component Framework implementation for Node.js and TypeScript.

For Enterprise applications.

**Status:** alpha-release

**npm:** https://www.npmjs.com/settings/dddl/packages

# Used in

Site: [faq.davidshekunts.com](https://faq.davidshekunts.com) / Repo: https://github.com/Dionid/headless-faq

# What does `Component Framework` means?
DDD Light is based on multiple patterns, models and ideas, inluding: DDD, CQRS, EDA, SOA, ROP, DAL and so on.

But the main idea of DDD Light is to make it possible to use those concepts separately: you need just Repository? Take `@dddl/dal` package. You want to include CQRS? Just implement `@dddl/cqrs` package and that's all. Want power of Event Driven Architecture? `@dddl/eda` comes to rescue.

There is no need to take whole DDD to your project if you need just a part of it.

This gives you opportunity to include this libraries in existing project concept by concept (package by package).
