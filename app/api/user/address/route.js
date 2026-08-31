import {
  GET as getAddressHandler,
  POST as postAddressHandler,
  PUT as putAddressHandler,
  DELETE as deleteAddressHandler,
} from "../../address/route";

export async function GET(request) {
  return getAddressHandler(request);
}

export async function POST(request) {
  return postAddressHandler(request);
}

export async function PUT(request) {
  return putAddressHandler(request);
}

export async function DELETE(request) {
  return deleteAddressHandler(request);
}
