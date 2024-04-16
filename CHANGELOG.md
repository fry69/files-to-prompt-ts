commit 2e05c9d6c46d64a314bc734ec085abb13da70d6b
Date:   Tue Apr 16 17:41:39 2024 +0200

    Add support for non-existent paths and reduce sleep time in tests

 2 files changed, 9 insertions(+), 4 deletions(-)

---

commit 3d29134ff859a52bf2bc24b91166136500969edd
Date:   Tue Apr 16 14:55:01 2024 +0200

    Adjust sleepTime for tests

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit 1c5ea81dacc7ff178e4e8d44f2f6cb06826311ed
Date:   Tue Apr 16 14:52:19 2024 +0200

    Switch to mock based testing instead of child_process

 2 files changed, 146 insertions(+), 83 deletions(-)

---

commit 32f99fbfc3d15202578fe555b8832186ab837457
Date:   Tue Apr 16 06:13:43 2024 +0200

    Refactor file processing logic and enable strict TypeScript checks
    
    - Add explicit handling for single files, directories, and unsupported file types
    - Enable strict TypeScript checks to catch unused code

 2 files changed, 20 insertions(+), 17 deletions(-)

---

commit 2cc985d4f4e0dc6cbe0546de91317ae25e86ed46
Date:   Mon Apr 15 23:14:12 2024 +0200

    Update .gitignore rules for directories while preserving overall configuration
    - Optimize directory processing by reusing the existing configuration when possible
    - Only create a new configuration when a new .gitignore file is found in the current directory hierarchy

 1 file changed, 7 insertions(+), 2 deletions(-)

---

commit 2a46cf309f5166709d09d8e8a289aa7d39be01db
Date:   Mon Apr 15 22:32:31 2024 +0200

    Add support for excluding files and directories based on .gitignore patterns in different directories

 2 files changed, 52 insertions(+), 16 deletions(-)

---

commit 0a04a27f5050343b7df4d0c942fa7153907beb5f
Date:   Mon Apr 15 21:20:38 2024 +0200

    Mention that only simple .gitignore patters are supported

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit ab1e230026a5e2a89f9feb88288c01cc6808d3e7
Date:   Mon Apr 15 21:18:48 2024 +0200

    Refactor binary file detection

 1 file changed, 14 insertions(+), 24 deletions(-)

---

commit 5ad7a8ca467cf2023337e17c5e0461dbe8c4e60e
Date:   Mon Apr 15 20:11:21 2024 +0200

    Fix indentation

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit ba50d7db84582fb741f148d8473f88eb41de9dc2
Date:   Mon Apr 15 20:05:14 2024 +0200

    Make Typescript happy

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit bd2f1f7bfb0f8d907093f919b682f8e401b02fca
Date:   Mon Apr 15 19:08:49 2024 +0200

    Add support for skipping binary files
    - include test for binary data

 2 files changed, 61 insertions(+), 29 deletions(-)

---

commit 8826e779ee81cb656a2f2a001bbdc9bcbcf0344d
Date:   Mon Apr 15 17:49:33 2024 +0200

    Add support for excluding directories matching patterns in .gitignore
    - Refactor `shouldIgnore` function to handle directory patterns
    - Add test case to verify excluding directories matching .gitignore patterns

 2 files changed, 22 insertions(+)

---

commit 6c3db470ee44b37b8e845361740134f9ebd265b7
Date:   Mon Apr 15 16:48:59 2024 +0200

    typo fix in README.md

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit 409f646db875f395eec17cb7a407161c0b434568
Date:   Mon Apr 15 16:42:53 2024 +0200

---

    Add MIT license file

 1 file changed, 21 insertions(+)

---

commit d8ed4e2de6b550b92b0564be1f15f453cfd4844d
Date:   Mon Apr 15 16:36:45 2024 +0200

    Update README.md
    - Add a note that this is a TypeScript port of the original Python tool
    - Update installation instructions to use Bun (and possibly Node) instead of Bun-only
    - Clarify usage examples and include a usage example that shows how to pipe the output to another tool (e.g. `llm`)
    - Add a section for running tests

 1 file changed, 20 insertions(+), 12 deletions(-)

---

commit ae26cda0830493485968b386e1a7304508df233c
Date:   Mon Apr 15 15:54:40 2024 +0200

    Add .attic to .gitignore

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit 4dd4a4d445ab9cd002680c4f7987ab10be516cf3
Date:   Mon Apr 15 15:53:54 2024 +0200

    Refactor tests to use Bun's built-in test framework

 3 files changed, 34 insertions(+), 40 deletions(-)

---

commit 8765eeeb5ae7a4f2d173102fe44b0e3b51f58f2b
Date:   Mon Apr 15 15:17:50 2024 +0200

    Add private trash folder to .gitignore

 1 file changed, 3 insertions(+)

---

commit c5cb8ad4dc9d652addef153462bccbcb3dc2c6b3
Date:   Mon Apr 15 15:17:25 2024 +0200

    Update README with tool description, installation, and usage instructions
    - Describes the purpose and functionality of the `files-to-prompt` tool
    - Provides instructions for installing the tool using Bun
    - Includes examples of how to use the tool with various options

 1 file changed, 41 insertions(+), 7 deletions(-)

---

commit 79bae42ee54f71e2f48bd1964c28cd7c19180ee8
Date:   Mon Apr 15 15:16:33 2024 +0200

    Add new file 'files-to-prompt.test.js' with tests for 'files-to-prompt.ts'

 1 file changed, 115 insertions(+)

---

commit 86276e52bafd1a796836a5a00a7b791716f59311
Date:   Mon Apr 15 15:15:35 2024 +0200

    Add support for processing single files in the `files-to-prompt.ts` script

 1 file changed, 44 insertions(+), 25 deletions(-)

---

commit 4308f19f1d6acb500064c9716b0ebe108f7abcdc
Date:   Mon Apr 15 15:04:01 2024 +0200

    Initial commit
    - add a .gitignore file and a basic README.md
    - etc

 6 files changed, 328 insertions(+)
