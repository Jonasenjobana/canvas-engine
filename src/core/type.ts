import { BBox } from "rbush";

export type SlBBox<T = any> = BBox & { data: T }