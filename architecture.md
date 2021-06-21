# Architecture <!-- omit in toc -->

_This document describes the high level architecture of the Joy CLI._

# Table of Contents <!-- omit in toc -->

- [Birds Eye View](#birds-eye-view)

# Birds Eye View

- Supports Bash by default which means that launching any other script language like NodeJS should be trivial
- Relies upon Docker images to provide, and isolate, heavy dependencies such as AWS SDK, GitHub CLI, Azure DevOps CLI, etc.  
