import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    videos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ]
  },
  { timestamps: true },
);

export const Playlist=mongoose.model("Playlist",PlaylistSchema)