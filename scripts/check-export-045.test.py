#!/usr/bin/env python3
"""045 unit/negative tests: no external media or actual film needed."""
import copy
import importlib.util
from pathlib import Path
import struct
import tempfile
import unittest

SOURCE = Path(__file__).with_name("check-export-045.py")
loader=importlib.util.spec_from_file_location("check_export_045", SOURCE)
module=importlib.util.module_from_spec(loader)
loader.loader.exec_module(module)

PRESET={
  "status":"SYNTHETIC_EXPORT_QA_ONLY",
  "filmExportAuthorized":False,
  "publishAuthorized":False,
  "sourcePolicy":{"thirdPartyFootageAllowed":False,"realPilotTimelineUsed":False},
}
VIDEO={
  "codec_type":"video","codec_name":"h264","profile":"High",
  "width":1920,"height":1080,"pix_fmt":"yuv420p",
  "avg_frame_rate":"30/1","r_frame_rate":"30/1","nb_read_frames":"240",
  "sample_aspect_ratio":"1:1","color_primaries":"bt709","color_transfer":"bt709",
  "color_space":"bt709","color_range":"tv","duration":"8.000000",
}
AUDIO={
  "codec_type":"audio","codec_name":"aac","profile":"LC",
  "sample_rate":"48000","channels":2,"channel_layout":"stereo",
  "duration":"8.000000",
}
PROBE={"format":{"format_name":"mov,mp4,m4a,3gp,3g2,mj2","duration":"8.000000"},
       "streams":[VIDEO,AUDIO]}

class ExportTests(unittest.TestCase):
    def test_positive_exact_metadata(self):
        self.assertEqual(len(module.validate_probe_data(PROBE,PRESET)),2)

    def test_no_video_or_audio_or_extra_tracks(self):
        for streams in ([VIDEO], [AUDIO], [VIDEO,AUDIO,AUDIO], []):
            with self.assertRaises(module.CheckFailed):
                module.validate_probe_data({**PROBE,"streams":streams},PRESET)

    def test_video_profiles_and_timing_rejected(self):
        bad=[
            ("codec_name","hevc"),("profile","Main"),("width",1280),
            ("height",720),("pix_fmt","yuv444p"),("avg_frame_rate","30000/1001"),
            ("r_frame_rate","30000/1001"),("nb_read_frames","239"),
            ("sample_aspect_ratio","4:3"),("color_primaries","bt2020"),
            ("color_transfer","smpte2084"),("color_space","bt2020nc"),
            ("color_range","pc"),("duration","7.0"),
        ]
        for key,value in bad:
            with self.subTest(key=key,value=value):
                p=copy.deepcopy(PROBE);p["streams"][0][key]=value
                with self.assertRaises(module.CheckFailed):module.validate_probe_data(p,PRESET)

    def test_audio_profile_and_timing_rejected(self):
        for key,value in [
            ("codec_name","mp3"),("profile","HE-AAC"),("sample_rate","44100"),
            ("channels",1),("channel_layout","mono"),("duration","6.1"),
        ]:
            with self.subTest(key=key):
                p=copy.deepcopy(PROBE);p["streams"][1][key]=value
                with self.assertRaises(module.CheckFailed):module.validate_probe_data(p,PRESET)

    def test_release_gates_must_remain_false(self):
        for mutate in [
            lambda p:p.update(publishAuthorized=True),
            lambda p:p.update(filmExportAuthorized=True),
            lambda p:p["sourcePolicy"].update(thirdPartyFootageAllowed=True),
            lambda p:p["sourcePolicy"].update(realPilotTimelineUsed=True),
            lambda p:p.update(status="PUBLIC"),
        ]:
            p=copy.deepcopy(PRESET);mutate(p)
            with self.assertRaises(module.CheckFailed):module.validate_probe_data(PROBE,p)

    def test_wrong_duration_and_container_fail(self):
        for patch in [{"duration":"60.0"},{"duration":"7.2"},{"format_name":"matroska"}]:
            p=copy.deepcopy(PROBE);p["format"].update(patch)
            with self.assertRaises(module.CheckFailed):module.validate_probe_data(p,PRESET)

    def test_faststart_parses_real_box_positions_not_embedded_text(self):
        def box(name,payload):
            return struct.pack(">I4s",8+len(payload),name.encode("ascii"))+payload
        ftyp=box("ftyp",b"isom0000")
        moov=box("moov",b"sample mdat fake")
        mdat=box("mdat",b"not real video"*11000)
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"test.mp4"
            path.write_bytes(ftyp+moov+mdat)
            self.assertEqual(module.mp4_top_boxes(path),["ftyp","moov","mdat"])
            path.write_bytes(ftyp+mdat+moov)
            with self.assertRaises(module.CheckFailed):module.mp4_top_boxes(path)
            path.write_bytes(ftyp+mdat)
            with self.assertRaises(module.CheckFailed):module.mp4_top_boxes(path)
            path.write_bytes(ftyp+moov+mdat[:-1])
            with self.assertRaises(module.CheckFailed):module.mp4_top_boxes(path)
            path.write_bytes(ftyp+moov+box("moof",b"x")+mdat)
            with self.assertRaises(module.CheckFailed):module.mp4_top_boxes(path)

    def test_no_fake_success_from_empty_or_corrupt_file(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/"empty.mp4"
            for contents in (b"", b"junk", b"\x00"*115000):
                path.write_bytes(contents)
                with self.assertRaises(module.CheckFailed):module.mp4_top_boxes(path)

if __name__=="__main__":
    unittest.main(verbosity=2)
