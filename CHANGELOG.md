commit d85fd744dc7607cbc5dd2fe7b64b2ca47ec3ddad
Date:   Fri Apr 19 11:05:21 2024 +0200

    build: fts-v0.4.3-min.js

 2 files changed, 10 insertions(+), 3 deletions(-)

---

commit aca86d350c50cfc7ae4a67fdf13370efe7d9e576
Date:   Fri Apr 19 11:01:45 2024 +0200

    Bump version to 0.4.3

 4 files changed, 41 insertions(+), 41 deletions(-)

---

commit 6a505716aff851ab2af3f7c6a3ebc7e124d7354e
Date:   Fri Apr 19 10:46:56 2024 +0200

    feat: Deno and Node compatibility
    
    - test Deno with `deno run -A ./files-to-prompt.ts testfolder`
    - Node will be supported by providing a minified version of this script
      generated with `bun build --minify`
    - minified version already works with Node on my machine

 1 file changed, 25 insertions(+), 4 deletions(-)

---

commit 4a37a2e729f89ee7fb8fdbc3fc9373869bfd24c3
Date:   Fri Apr 19 10:46:41 2024 +0200

    chore: ignore generated Deno types, needed for compatibility testing

 1 file changed, 5 insertions(+)

---

commit fd6a30923bd6cc8d6e9c4aed8f0f3edb6e7c18a7
Date:   Fri Apr 19 07:18:04 2024 +0200

    doc: another small fix in nbconvert-shim.ts

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit cd9013b84a82e066c820f6abc8f82fd6b40c2adf
Date:   Fri Apr 19 07:06:38 2024 +0200

    doc: nbconvert-shim.ts

 1 file changed, 8 insertions(+), 1 deletion(-)

---

commit 1d8740644240f9dcb45085197ed7aeaf93c81238
Date:   Thu Apr 18 22:02:37 2024 +0200

    Update README.md with fast tests

 1 file changed, 37 insertions(+), 41 deletions(-)

---

commit cb548fdbfa6d3ed8a0f494cb5c5ad9ac7acd7acf
Date:   Thu Apr 18 21:54:15 2024 +0200

    feat: nbconvert-shim for fast testing
    
    - produces the same output as the real nbconvert for test cases
    - optionally the real nbconvert can still be called for testing

 3 files changed, 47 insertions(+), 2 deletions(-)

---

commit 4d465ca6055db3efaa1930b2c56ecc84f7c5943c
Date:   Thu Apr 18 18:06:36 2024 +0200

    Bump version to 0.4.2

 4 files changed, 44 insertions(+), 44 deletions(-)

---

commit bc6498951268891b4779f409b91f370f30a2d876
Date:   Thu Apr 18 18:00:55 2024 +0200

    fix: glaring readStdin() inconsistent definition

 1 file changed, 1 insertion(+), 2 deletions(-)

---

commit 2254475b05d988f4f677f3044cf20e88715c4b6a
Date:   Thu Apr 18 17:43:18 2024 +0200

    doc: fix the same typo a line below in README.md

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit 52c393764bd10e4d6d520e43408f660fc5ad08ba
Date:   Thu Apr 18 17:41:14 2024 +0200

    doc: fix typo in README.md

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit f56b11e912d22551ee21d308b9fe32dc49bb592f
Date:   Thu Apr 18 17:30:15 2024 +0200

    doc: fix overlong line in README.md

 1 file changed, 2 insertions(+), 1 deletion(-)

---

commit 2152fc7288fd91199c557897c9ec718a73f220ff
Date:   Thu Apr 18 17:25:27 2024 +0200

    doc: revamp README.md

 1 file changed, 61 insertions(+), 39 deletions(-)

---

commit 6f343bca2a8c050776912d5ffbe811cc61d56551
Date:   Thu Apr 18 15:36:27 2024 +0200

    Update changelog

 1 file changed, 47 insertions(+)

---

commit def336ee754fbfe9ac7cc4480a99d67ad6ad4398
Date:   Thu Apr 18 15:34:52 2024 +0200

    Bump version to 0.4.1

 3 files changed, 5 insertions(+), 5 deletions(-)

---

commit 438afe1b351fcf748d171821b7a9a19d0d9ac0ee
Date:   Thu Apr 18 15:32:05 2024 +0200

    fix: check and ignore --nbconvert if command is not found

    - additional test cases

 3 files changed, 73 insertions(+), 39 deletions(-)

---

commit 39589e1137765ffe2aec22b401a64faff1467274
Date:   Thu Apr 18 14:57:37 2024 +0200

    Add disclaimer section to README.md

 1 file changed, 4 insertions(+)

---

commit c9123aeb12538917151b9fe509eb0e8c48f14ece
Date:   Thu Apr 18 13:43:31 2024 +0200

    fix: error should not get exported

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit 36ffcc29b7e20663949cba98b49f2f0f1cea5675
Date:   Thu Apr 18 13:28:20 2024 +0200

    Update changelog

 1 file changed, 36 insertions(+)

---

commit 2317d3ff546e8008efa61bfe48df0cdc772794eb
Date:   Thu Apr 18 13:26:56 2024 +0200

    Bump version to 0.4.0

 3 files changed, 41 insertions(+), 39 deletions(-)

---

commit 5802d3f6375e945773ae0c9f7171bfe9c3acc844
Date:   Thu Apr 18 13:24:31 2024 +0200

    feat: convert Jupyter Notebook files on-the-fly with nbconvert

 3 files changed, 145 insertions(+), 10 deletions(-)

---

commit ddacb0c081be47bbc1bbce973e5298a440134101
Date:   Thu Apr 18 13:06:28 2024 +0200

    Fix compatibility note about Deno in README.md

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit c474eaa3238bfd01dc6f3cb49fe2e41b8b0b6cb9
Date:   Thu Apr 18 08:47:09 2024 +0200

    Update changelog

 1 file changed, 36 insertions(+)

---

commit 0f8c5ff3c67e6c468a9c2dbce6d0e4f63f00c3b3
Date:   Thu Apr 18 08:46:06 2024 +0200

    Bump version to 0.3.0

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit 497d702b07026cc9aee1ecf931ee26a717fb3d92
Date:   Thu Apr 18 08:45:37 2024 +0200

    Update README.md with new --output feature

 1 file changed, 38 insertions(+), 30 deletions(-)

---

commit 551a149364240a768faf47f355c306a2a34748e8
Date:   Thu Apr 18 08:41:36 2024 +0200

    feat: redirect out to file with cli option

 2 files changed, 139 insertions(+), 7 deletions(-)

---

commit 31ef9ca078a0d69bc3464b3f27ff1478819ebec7
Date:   Wed Apr 17 23:09:44 2024 +0200

    Update changelog

 1 file changed, 27 insertions(+)

---

commit 752a04bcb375969baed7d13be85deab401a6fe3c
Date:   Wed Apr 17 23:08:46 2024 +0200

    Bump version to 0.2.1

 3 files changed, 37 insertions(+), 29 deletions(-)

---

commit 4d3746a8748bbc889500dbc3c62a61226900c74a
Date:   Wed Apr 17 23:05:31 2024 +0200

    More robust filename parsing via stdin

 2 files changed, 89 insertions(+), 3 deletions(-)

---

commit 23c5a27653a2bc398bff8dcbb0338922a13558d2
Date:   Wed Apr 17 20:02:43 2024 +0200

    Update changelog

 1 file changed, 54 insertions(+)

---

commit db6126b20f16b14619703aa887579c947eccdf84
Date:   Wed Apr 17 20:01:15 2024 +0200

    Bump version to 0.2.0

 2 files changed, 29 insertions(+), 25 deletions(-)

---

commit ad63d08ba819e2837958530799c73a26bb19bb1e
Date:   Wed Apr 17 19:58:17 2024 +0200

    feat: add support for --version option, catch unsupported options

 2 files changed, 21 insertions(+)

---

commit 842d7d8539a0e8276b346a270701d62740185508
Date:   Wed Apr 17 19:43:03 2024 +0200

    Update README.md

 1 file changed, 3 insertions(+)

---

commit 201c3823b6c77d4296f08e7a8da23eec2e834481
Date:   Wed Apr 17 19:36:41 2024 +0200

    feat: de-duplicate file paths received via stdin

 2 files changed, 14 insertions(+), 1 deletion(-)

--

commit bf4e83c9483097f58b4fa792f22392d5b3e8cad7
Date:   Wed Apr 17 19:26:50 2024 +0200

    feat: read and parse file paths from stdin

 2 files changed, 52 insertions(+), 1 deletion(-)

---

commit 283b12543ac994afee9087f965d0d8ec6817dde4
Date:   Wed Apr 17 16:16:55 2024 +0200

    Update changelog

 1 file changed, 76 insertions(+)

---

commit 4770c378034c5152381f7e6ae263aed131e65f70
Date:   Wed Apr 17 16:15:10 2024 +0200

    Bump jsr version to 0.1.7

 2 files changed, 3 insertions(+), 3 deletions(-)

---

commit a912f16952acb66b90408b320b3505f768a87cfd
Date:   Wed Apr 17 16:13:30 2024 +0200

    Update README.md with recent test output

 1 file changed, 23 insertions(+), 20 deletions(-)

---

commit 662ef15149a9c9a41af34121795cdd339711c5da
Date:   Wed Apr 17 16:09:52 2024 +0200

    Update test script
    
    - Add test case for multiple --ignore options
    - Add test case for --ignore option without an argument
    - Add test case for internal isBinaryFile function

 2 files changed, 44 insertions(+), 9 deletions(-)

---

commit 63815f768d9ae1f8426089bc54f2ba37865994d5
Date:   Wed Apr 17 15:19:04 2024 +0200

    Fix minor typo

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit 93269334468bec89fa78d5f12e74bb2287459125
Date:   Wed Apr 17 15:17:20 2024 +0200

    Testing footnotes

 1 file changed, 5 insertions(+), 3 deletions(-)

---

commit 096f6fdb90d3633df17e9ca40868c0307d5cdff3
Date:   Wed Apr 17 15:09:23 2024 +0200

    Switched to stable GitHub link

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit abd49b9789626305ca2c70e3d431f3744f24fecd
Date:   Wed Apr 17 15:05:07 2024 +0200

    Second try

 1 file changed, 8 insertions(+), 12 deletions(-)

---

commit 8421524cf0b74ab28be2c28ab57b0b2c5f85f638
Date:   Wed Apr 17 14:56:12 2024 +0200

    Testing collapsed content

 1 file changed, 23 insertions(+), 6 deletions(-)

---

commit d92aa0ca090c5042af578111fe0d2518aab68360
Date:   Wed Apr 17 12:41:25 2024 +0200

    Bump jsr version to 0.1.6

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit 9794cb7054064d1412e2995b6b21de0b5593c985
Date:   Wed Apr 17 12:40:24 2024 +0200

    Remove commander dependency from package.json

 2 files changed, 3 deletions(-)

---

commit 749985e6606ba5a8f080cb8f2d50a185c3850f6d
Date:   Wed Apr 17 12:36:15 2024 +0200

    Tiny polish

 1 file changed, 2 insertions(+), 2 deletions(-)

---

commit 0600c8b41a65949ba7a7d85532270af43bb9ce8b
Date:   Wed Apr 17 12:12:13 2024 +0200

    Bump jsr version to 0.1.5

 2 files changed, 19 insertions(+), 1 deletion(-)

---

commit 6774f2417e7d09d43c8dc3a6effd6431c9b07a31
Date:   Wed Apr 17 12:07:56 2024 +0200

    Add compatibility section to README.md

 2 files changed, 9 insertions(+), 2 deletions(-)

---

commit 801c6a63bf7945dde2901f37fb5cb66032fdd3d4
Date:   Wed Apr 17 11:32:28 2024 +0200

    Update changelog

 1 file changed, 193 insertions(+)

---

commit 3e27783f43e2eb9e07ef255e9f02bb68c2aebf62
Date:   Wed Apr 17 11:30:59 2024 +0200

    Bump jsr version to 0.1.4

    - removed npm install run from worklow as the script is now dependency free

 2 files changed, 2 insertions(+), 3 deletions(-)

---

commit cd3b8ce37deff2130c39a6b8aa90c71371869a3a
Date:   Wed Apr 17 11:17:29 2024 +0200

    Refactor argument parsing

    - removed dependency on commander, replaced by a simple switch parser
    - added Deno compatibility
    - refactored isBinaryFile again to make it compatible with Deno

 2 files changed, 63 insertions(+), 37 deletions(-)

---

commit b0bd1dcaf768f25a500ad91d8270d9da1083f0f0
Date:   Wed Apr 17 03:15:26 2024 +0200

    Bump jsr version to 0.1.3 to test workflow

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit 512159c5379c823c9481cec200846cbe4074746e
Date:   Wed Apr 17 03:04:59 2024 +0200

    Add --allow-dirty to jsr publish call in workflow

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit d643d4eccc19f8342f744cd9140356aaeff180d5
Date:   Wed Apr 17 03:02:35 2024 +0200

    Add npm install run to workflow

 1 file changed, 1 insertion(+)

---

commit ffd7a5b3adbd2bfa38f12c904cd7d02276010e3b
Date:   Wed Apr 17 02:53:38 2024 +0200

    Add GitHub workflow for publishing to jsr.io

 1 file changed, 18 insertions(+)

---

commit 49fd063e3824dbe0b12879494fea2389c5469bab
Date:   Wed Apr 17 01:18:26 2024 +0200

    Bump jsr.io version

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit 62e582bc8c194049aa2879f5ddb0fe556795b7eb
Date:   Wed Apr 17 01:16:32 2024 +0200

    Fix jsr.io badges in README.md

 1 file changed, 2 insertions(+), 2 deletions(-)

---

commit 07b69a34517a94015bbc41cfd83e53e08c046853
Date:   Wed Apr 17 01:07:13 2024 +0200

    Minor comment/wording polish

 1 file changed, 5 insertions(+), 3 deletions(-)

---

commit 87ddd156a555883238f8728b58feb97350dc0872
Date:   Wed Apr 17 00:51:03 2024 +0200

    Add note about warnings to README.md

 1 file changed, 1 insertion(+)

---

commit ae2ba3c68e6517252e6938b651ece7a42042872d
Date:   Wed Apr 17 00:45:05 2024 +0200

    Add example output section to README.md

 1 file changed, 13 insertions(+), 1 deletion(-)

---

commit 6f9f333b790599b7a7c8b6c508fa9ffa976be5b1
Date:   Wed Apr 17 00:32:40 2024 +0200

    Fix too long example line in README.md

 1 file changed, 3 insertions(+), 2 deletions(-)

---

commit a710bf0c83522c41cf12373dee016c9e946e7a56
Date:   Wed Apr 17 00:10:54 2024 +0200

    Add jsr.io badges to README.md

 1 file changed, 3 insertions(+)

---

commit ade15cd201109278793a35c836a53f20f46b11d7
Date:   Tue Apr 16 23:58:09 2024 +0200

    Bump jsr.io version

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit bd2a378529e7375b43ee459fa08613cf95ed7526
Date:   Tue Apr 16 23:56:15 2024 +0200

    Add JSDoc documentation/comments for symbols

 1 file changed, 75 insertions(+), 5 deletions(-)

---

commit d300a408bafc46535a2e67167953d5490dddfcb6
Date:   Tue Apr 16 23:34:15 2024 +0200

    Remove Node compatibility from README.md

 1 file changed, 1 insertion(+), 1 deletion(-)

---

commit d3920d59519d59900d133220d71ca61a92b9ad05
Date:   Tue Apr 16 23:21:06 2024 +0200

    Prepare to publish to jsr.io

 2 files changed, 8 insertions(+), 1 deletion(-)

---

commit f6c2ffefd0c1f7b905c6ad47cd6094cd20d9ed58
Date:   Tue Apr 16 23:03:03 2024 +0200

    A few more comments, minor polish

 2 files changed, 19 insertions(+), 9 deletions(-)

---

commit feb5566b57256f4ddd0b577085508f0b18bebc8c
Date:   Tue Apr 16 18:00:18 2024 +0200

    Comments for untestable codepaths

 1 file changed, 5 insertions(+)

---

commit 93c45324607d9cc889a1925863d320bcbee1b171
Date:   Tue Apr 16 17:51:23 2024 +0200

    Add example test run output to README

 1 file changed, 33 insertions(+), 1 deletion(-)

---

commit 85651de5184386546867d4a46e8eb2f828c8aa99
Date:   Tue Apr 16 17:47:06 2024 +0200

    Update changelog

 1 file changed, 9 insertions(+)

---

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
