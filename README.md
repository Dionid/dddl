# Domain Driven Design ⚡️ Light ⚡️ Component Framework for Node.js and TypeScript
[![License](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](https://github.com/Dionid/dddl/blob/master/LICENSE.md)

**Status:** deprecated

**npm:** https://www.npmjs.com/settings/dddl/packages

Domain Driven Design Light (DDDL) Component Framework implementation for Node.js and TypeScript.

Expeccialy good for Enterprise-grade applications.

More about `DDD Light` you can find [here](https://new.davidshekunts.com/encyclopedia-domain-driven-design-light-what-is-it-and-why/)

# DEPRECATION NOTES

This library mostly based on OOP principles (like encapsulation, inheritance, rich domain model (RDM), etc.) and js mechanics (like classes), but, as time goes, I realized how Functional approach makes my code much clearer, easy to write and evolve (data and behaviour separation, instead of encapsulation and RDM, composition over inheritance, ADT insted of classes, etc.), that's why I'm on my way to refactore this library in a Functional way.

Mostly this will affect only syntax (`classes` will become `types` and `funtions`).

More news will come soon.

# Used in

1. [faq.davidshekunts.com](https://faq.davidshekunts.com) (site) + https://github.com/Dionid/headless-faq (repo) 


# What does "Component Framework" means?
`DDD Light` is based on multiple patterns, models and ideas, inluding: `DDD`, `CQRS`, `EDA`, `SOA`, `ROP`, `DAL` and so on.

But the main idea of `DDD Light` is to give you **abillity to use those concepts separately**:

- Уou need just `Repository`? Take `@dddl/dal` package.
- You want to include `CQRS`? Just implement `@dddl/cqrs` package and that's all.
- Want power of `Event Driven Architecture`? `@dddl/eda` comes to rescue.
- etc.

There is no need to take whole `DDD` to your project if you need just a part of it.

This gives you opportunity to include this libraries in existing project concept by concept (package by package).

More about `DDD Light` you can find [here](https://new.davidshekunts.com/encyclopedia-domain-driven-design-light-what-is-it-and-why/)
