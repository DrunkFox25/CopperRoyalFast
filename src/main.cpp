#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/html5.h>

#include "include/core/SkCanvas.h"
#include "include/core/SkPaint.h"
#include "include/core/SkSurface.h"
#include "include/gpu/GrDirectContext.h"
#include "include/gpu/gl/GrGLInterface.h"
#include "include/gpu/gl/GrGLTypes.h"

using namespace emscripten;

void drawOnCanvas(std::string canvasId) {
    // 1. Tell Emscripten to target the specific <canvas> ID
    EmscriptenWebGLContextAttributes attr;
    emscripten_webgl_init_context_attributes(&attr);
    attr.majorVersion = 2; // Use WebGL 2
    EMSCRIPTEN_WEBGL_CONTEXT_HANDLE ctx = emscripten_webgl_create_context(canvasId.c_str(), &attr);
    emscripten_webgl_make_context_current(ctx);

    // 2. Initialize the Skia GPU Context
    auto interface = GrGLMakeNativeInterface();
    sk_sp<GrDirectContext> grContext = GrDirectContext::MakeGL(interface);

    // 3. Create a Skia Surface (the "Drawing Paper")
    GrGLFramebufferInfo fbInfo;
    fbInfo.fFBOID = 0; // The default screen framebuffer
    fbInfo.fFormat = 0x8058; // GL_RGBA8

    GrBackendRenderTarget backendRT(500, 500, 1, 8, fbInfo);
    sk_sp<SkSurface> surface = SkSurface::MakeFromBackendRenderTarget(
        grContext.get(), backendRT, kBottomLeft_GrSurfaceOrigin,
        kRGBA_8888_SkColorType, nullptr, nullptr);

    // 4. DRAW SOMETHING!
    SkCanvas* canvas = surface->getCanvas();
    SkPaint paint;
    paint.setColor(SK_ColorRED);
    paint.setAntiAlias(true);

    canvas->clear(SK_ColorWHITE); // Background
    canvas->drawRect(SkRect::MakeXYWH(100, 100, 200, 200), paint);

    // 5. Flush to the screen
    grContext->flush();
}

EMSCRIPTEN_BINDINGS(skia_module) {
    function("drawOnCanvas", &drawOnCanvas);
}







/*
// --- IMPORTING JS TO C++ ---
// This defines a C++ function that actually runs JS code
EM_JS(void, js_alert, (const char* msg), {
  alert(UTF8ToString(msg));
});

EM_JS(void, js_log, (int value), {
  console.log("C++ sent this value to JS console:", value);
});

// --- EXPORTING C++ TO JS ---
void run_logic() {
    // Calling the "imported" JS functions
    js_log(42);
    js_alert("Hello from Skia C++!");
}

EMSCRIPTEN_BINDINGS(my_module) {
    emscripten::function("run_logic", &run_logic);
}
*/