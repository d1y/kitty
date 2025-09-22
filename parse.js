const fs = require('fs')
const path = require('path')
const ts = require('typescript');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;

/** @type {(rawCode: string) => string} */
function parseWithStr(rawCode) {
  // 步骤1: 将TS转译为JS
  const jsCode = ts.transpileModule(rawCode, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      removeComments: false
    }
  }).outputText;

  // 步骤2: 解析JS为AST
  const ast = parser.parse(jsCode, {
    sourceType: 'module',
    plugins: ['classProperties']
  });


  /** @type {Iconfig} */
  const config = {}

  // 存储所有方法的压缩代码
  const methodCodes = {};

  // 步骤3: 找到导出的类名（支持默认导出和命名导出）
  let targetClassName = null;

  // 查找 exports.default = ClassName 模式（默认导出）
  traverse(ast, {
    AssignmentExpression(path) {
      if (path.node.left.type === 'MemberExpression' &&
        path.node.left.object.name === 'exports' &&
        path.node.left.property.name === 'default' &&
        path.node.right.type === 'Identifier') {
        targetClassName = path.node.right.name;
      }
    }
  });

  // 如果没有找到默认导出，查找命名导出的类
  if (!targetClassName) {
    traverse(ast, {
      ClassDeclaration(path) {
        // 检查类是否实现了 Handle 接口
        if (path.node.implements && path.node.implements.some(impl => impl.expression?.name === 'Handle')) {
          targetClassName = path.node.id?.name;
        }
      }
    });
  }

  // 步骤4: 提取配置和压缩return语句
  traverse(ast, {
    ClassDeclaration(path) {
      if (path.node.id?.name === targetClassName) {
        path.get('body').get('body').forEach(methodPath => {
          // 解析 getConfig 方法
          if (methodPath.node.key?.name === 'getConfig') {
            methodPath.traverse({
              ReturnStatement(returnPath) {

                // 直接处理 ObjectExpression（TypeScript转译后类型断言被移除）
                if (returnPath.node.argument.type === 'ObjectExpression') {
                  const expression = returnPath.node.argument;
                  expression.properties.forEach(prop => {
                    if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
                      const key = prop.key.name;
                      let value;
                      if (prop.value.type === 'StringLiteral') {
                        value = prop.value.value;
                      } else if (prop.value.type === 'NumericLiteral') {
                        value = prop.value.value;
                      } else if (prop.value.type === 'BooleanLiteral') {
                        value = prop.value.value;
                      }
                      config[key] = value;
                    }
                  });
                }
                returnPath.stop();
              }
            });
          }
          // 解析所有相关方法
          const methodName = methodPath.node.key?.name;
          if (['getCategory', 'getHome', 'getDetail', 'getSearch', 'parseIframe'].includes(methodName)) {
            // 根据方法名映射到配置字段
            const methodMapping = {
              'getCategory': 'category',
              'getHome': 'home',
              'getDetail': 'detail',
              'getSearch': 'search',
              'parseIframe': 'parseIframe'
            };

            const configKey = methodMapping[methodName];
            if (!configKey) return;

            // 特殊处理 getCategory - 检查是否直接返回数组
            if (methodName === 'getCategory') {
              // 查找 return 语句
              methodPath.traverse({
                ReturnStatement(returnPath) {
                  const returnArg = returnPath.node.argument;

                  // 检查是否直接返回数组
                  if (returnArg && (returnArg.type === 'ArrayExpression' ||
                    (returnArg.type === 'TSTypeAssertion' && returnArg.expression.type === 'ArrayExpression') ||
                    (returnArg.type === 'TSAsExpression' && returnArg.expression.type === 'ArrayExpression'))) {

                    // 提取数组表达式
                    let arrayExpr = returnArg;
                    if (returnArg.type === 'TSTypeAssertion' || returnArg.type === 'TSAsExpression') {
                      arrayExpr = returnArg.expression;
                    }

                    // 将数组转换为实际的 JavaScript 对象
                    try {
                      const { code: arrayCode } = generator(arrayExpr, {
                        compact: true,
                        minified: true,
                        comments: false
                      });

                      // 使用 eval 来解析数组（在安全的环境中）
                      const categoryArray = eval(arrayCode);
                      methodCodes[configKey] = categoryArray;
                    } catch (error) {
                      // 如果解析失败，回退到函数体代码
                      const { code } = generator(methodPath.node.body, {
                        compact: true,
                        minified: true,
                        comments: false
                      });
                      methodCodes[configKey] = code.replace(/^\{/, '').replace(/\}$/, '');
                    }
                  } else {
                    // 不是直接返回数组，使用函数体代码
                    const { code } = generator(methodPath.node.body, {
                      compact: true,
                      minified: true,
                      comments: false
                    });
                    methodCodes[configKey] = code.replace(/^\{/, '').replace(/\}$/, '');
                  }
                  returnPath.stop();
                }
              });
            } else {
              // 其他方法正常处理
              if (methodPath.node.body && methodPath.node.body.type === 'BlockStatement') {
                const { code } = generator(methodPath.node.body, {
                  compact: true,
                  minified: true,
                  comments: false
                });

                // 移除外层的大括号，只保留函数体内容
                let cleanCode = code.replace(/^\{/, '').replace(/\}$/, '');
                methodCodes[configKey] = cleanCode;
              }
            }
          }
        });
      }
    }
  });

  // 将方法代码合并到 config.extra.js 中
  if (Object.keys(methodCodes).length > 0) {
    config.extra = config.extra || {};
    config.extra.js = methodCodes;
  }

  return config
}

/** @type {(file: string) => Iconfig | null} */
function parseWithFile(file) {
  try {
    const rawCode = fs.readFileSync(file, 'utf-8')
    const result = parseWithStr(rawCode)
    // 只返回有效的配置（至少要有id）
    return result.id ? result : null
  } catch (error) {
    console.warn(`解析文件失败: ${file}`, error.message)
    return null
  }
}

/** @type {(dir: string) => string[]} */
function scanTsFiles(dir) {
  const tsFiles = []

  function scanDirectory(currentDir) {
    try {
      const items = fs.readdirSync(currentDir)

      for (const item of items) {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          // 跳过 node_modules 和 .git 等目录
          if (!['node_modules', '.git', '.vscode', 'dist', 'build'].includes(item)) {
            scanDirectory(fullPath)
          }
        } else if (stat.isFile() && item.endsWith('.ts')) {
          tsFiles.push(fullPath)
        }
      }
    } catch (error) {
      console.warn(`扫描目录失败: ${currentDir}`, error.message)
    }
  }

  scanDirectory(dir)
  return tsFiles
}

/** @type {(dir: string, verbose?: boolean) => Iconfig[]} */
function parseAllTsFiles(dir, verbose = true) {
  const tsFiles = scanTsFiles(dir)
  const configs = []

  if (verbose) {
    console.log(`找到 ${tsFiles.length} 个 TypeScript 文件`)
  }

  for (const file of tsFiles) {
    if (verbose) {
      console.log(`正在解析: ${file}`)
    }
    const config = parseWithFile(file)
    if (config) {
      configs.push(config)
      if (verbose) {
        console.log(`✓ 成功解析: ${config.name || config.id}`)
      }
    }
  }

  return configs
}

// 获取命令行参数
const args = process.argv.slice(2)
const outputFile = args[0]

// 扫描当前目录下的所有 TypeScript 文件
const currentDir = process.cwd()
const allConfigs = parseAllTsFiles(currentDir, !outputFile)

if (outputFile) {
  // 写入到指定文件
  try {
    fs.writeFileSync(outputFile, JSON.stringify(allConfigs, null, 2), 'utf-8')
    console.log(`✓ 成功将 ${allConfigs.length} 个配置写入到 ${outputFile}`)
  } catch (error) {
    console.error(`✗ 写入文件失败: ${error.message}`)
    process.exit(1)
  }
} else {
  // 默认输出到控制台（注释掉详细信息）
  // console.log('\n=== 扫描结果 ===')
  // console.log(`总共解析出 ${allConfigs.length} 个有效配置`)
  // console.log('\n完整配置数组:')
  // console.log(JSON.stringify(allConfigs, null, 2))

  console.log(`扫描完成，找到 ${allConfigs.length} 个有效配置`)
  console.log('使用方法: bun parse.js [输出文件名] 来将结果保存到文件')
}