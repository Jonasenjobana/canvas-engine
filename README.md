本地测试
pnpm link 路径
link node_modules到路径项目下可以直接使用
pacckage.name 为 包名
每次修改后需要执行npm run build 生成新的dist文件

jest测试
npm run test

参考knova.js

批处理相似元素
- 减少ctx切换笔画属性次数
脏检测渲染画布
- 一个canvas 通过drawImage 绘制多个 可以减少绘制次数
- rbush区域划分脏数据（turf）或许可以判断最小脏aabb盒然后清除对应区域的画布重绘
webgl渲染
- 通过gpu渲染以提高性能

TODO
1. 支持坐标系转化（坐标适配器)
2. 支持动画
3. 支持事件
4. AABB碰撞模型
5. 层级 事件冒泡处理
6. 事件 绝对(画布)坐标和相对(父元素)坐标
7. 支持缩放
8. 支持旋转
9. 支持平移
10. 支持裁剪